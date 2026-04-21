import { randomInt } from 'crypto';
import { AuthChallengePurpose, Prisma, type AuthChallenge } from '@prisma/client';
import nodemailer from 'nodemailer';
import { prisma } from './db';
import { hashPassword, verifyPassword } from './password';

export const authCodeLength = 6;
const authCodeMaxAttempts = 5;
const authCodeTtlMinutes = 10;
export const authCodeResendCooldownSeconds = 60;

export class AuthCodeDeliveryError extends Error {
  constructor() {
    super('Auth code delivery is not configured.');
  }
}

export class AuthCodeCooldownError extends Error {
  retryAt: Date;

  constructor(retryAt: Date) {
    super('Please wait before requesting another verification code.');
    this.retryAt = retryAt;
  }

  get retryAfterSeconds() {
    return Math.max(1, Math.ceil((this.retryAt.getTime() - Date.now()) / 1000));
  }
}

type CreateAuthChallengeInput = {
  email: string;
  purpose: AuthChallengePurpose;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
};

type VerifyAuthChallengeInput = {
  challengeId: string;
  email: string;
  purpose: AuthChallengePurpose;
  code: string;
};

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

function generateAuthCode() {
  return randomInt(0, 1_000_000).toString().padStart(authCodeLength, '0');
}

function getActiveChallengeKey(email: string, purpose: AuthChallengePurpose) {
  return `${purpose}:${email}`;
}

function isActiveKeyConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return false;
  }

  const target = error.meta?.target;
  return Array.isArray(target) ? target.includes('activeKey') : target === 'activeKey';
}

function shouldExposeDevelopmentCode() {
  if (process.env.AUTH_EXPOSE_DEV_CODE === 'true') {
    return true;
  }

  if (process.env.AUTH_EXPOSE_DEV_CODE === 'false') {
    return false;
  }

  return process.env.NODE_ENV !== 'production';
}

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.AUTH_EMAIL_FROM);
}

async function sendAuthCodeEmail(email: string, code: string, purpose: AuthChallengePurpose) {
  const port = Number(process.env.SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });
  const subject = purpose === AuthChallengePurpose.SIGN_UP
    ? 'Your Élanoire account code'
    : 'Your Élanoire sign-in code';

  await transporter.sendMail({
    from: process.env.AUTH_EMAIL_FROM,
    to: email,
    subject,
    text: `Your Élanoire verification code is ${code}. It expires in ${authCodeTtlMinutes} minutes.`,
    html: `<p>Your Élanoire verification code is <strong>${code}</strong>.</p><p>It expires in ${authCodeTtlMinutes} minutes.</p>`,
  });
}

async function deliverAuthCode(email: string, code: string, purpose: AuthChallengePurpose) {
  if (hasSmtpConfig()) {
    await sendAuthCodeEmail(email, code, purpose);
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new AuthCodeDeliveryError();
  }

  console.info('Auth verification code generated.', {
    email,
    purpose,
    code: shouldExposeDevelopmentCode() ? code : '[redacted]',
  });
}

export async function createAuthChallenge({
  email,
  purpose,
  firstName,
  lastName,
  passwordHash,
}: CreateAuthChallengeInput) {
  const normalisedEmail = normaliseEmail(email);
  const code = generateAuthCode();
  const codeHash = await hashPassword(code);
  const activeKey = getActiveChallengeKey(normalisedEmail, purpose);
  const now = new Date();
  const replaceableChallengeCutoff = new Date(now.getTime() - authCodeResendCooldownSeconds * 1000);
  const expiresAt = new Date(Date.now() + authCodeTtlMinutes * 60 * 1000);

  const activeChallenge = await prisma.authChallenge.findFirst({
    where: {
      email: normalisedEmail,
      purpose,
      consumedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  if (activeChallenge) {
    const retryAt = new Date(activeChallenge.createdAt.getTime() + authCodeResendCooldownSeconds * 1000);

    if (retryAt.getTime() > Date.now()) {
      throw new AuthCodeCooldownError(retryAt);
    }
  }

  let challenge: { id: string; expiresAt: Date } | null = null;

  try {
    const [, createdChallenge] = await prisma.$transaction([
      prisma.authChallenge.deleteMany({
        where: {
          email: normalisedEmail,
          purpose,
          consumedAt: null,
          createdAt: {
            lte: replaceableChallengeCutoff,
          },
        },
      }),
      prisma.authChallenge.create({
        data: {
          email: normalisedEmail,
          purpose,
          activeKey,
          codeHash,
          firstName,
          lastName,
          passwordHash,
          expiresAt,
        },
        select: {
          id: true,
          expiresAt: true,
        },
      }),
    ]);

    challenge = createdChallenge;
  } catch (error) {
    if (isActiveKeyConflict(error)) {
      const conflictingChallenge = await prisma.authChallenge.findUnique({
        where: { activeKey },
        select: { createdAt: true },
      });

      if (conflictingChallenge) {
        throw new AuthCodeCooldownError(
          new Date(conflictingChallenge.createdAt.getTime() + authCodeResendCooldownSeconds * 1000),
        );
      }
    }

    throw error;
  }

  if (!challenge) {
    throw new Error('Auth challenge could not be created.');
  }

  try {
    await deliverAuthCode(normalisedEmail, code, purpose);
  } catch (error) {
    await prisma.authChallenge.deleteMany({
      where: {
        id: challenge.id,
      },
    });

    throw error;
  }

  return {
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt,
    devCode: shouldExposeDevelopmentCode() ? code : undefined,
  };
}

export async function cleanupExpiredAuthChallenges() {
  await prisma.authChallenge.updateMany({
    where: {
      activeKey: {
        not: null,
      },
      consumedAt: null,
      expiresAt: {
        lte: new Date(),
      },
    },
    data: {
      activeKey: null,
    },
  });
}

export async function verifyAuthChallenge({
  challengeId,
  email,
  purpose,
  code,
}: VerifyAuthChallengeInput) {
  const challenge = await prisma.authChallenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge || challenge.email !== normaliseEmail(email) || challenge.purpose !== purpose) {
    return { ok: false as const, message: 'The verification code could not be confirmed.' };
  }

  if (challenge.consumedAt) {
    return { ok: false as const, message: 'This verification code has already been used.' };
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await prisma.authChallenge.updateMany({
      where: {
        id: challenge.id,
        activeKey: {
          not: null,
        },
      },
      data: {
        activeKey: null,
      },
    });

    return { ok: false as const, message: 'This verification code has expired.' };
  }

  if (challenge.attempts >= authCodeMaxAttempts) {
    return { ok: false as const, message: 'Too many verification attempts. Request a new code.' };
  }

  const isValidCode = await verifyPassword(code, challenge.codeHash);

  if (!isValidCode) {
    await prisma.authChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });

    return { ok: false as const, message: 'The verification code is incorrect.' };
  }

  return { ok: true as const, challenge };
}

export async function consumeAuthChallenge(challenge: AuthChallenge) {
  const result = await prisma.authChallenge.updateMany({
    where: {
      id: challenge.id,
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
      activeKey: null,
    },
  });

  return result.count === 1;
}
