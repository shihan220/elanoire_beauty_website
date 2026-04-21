import { randomInt } from 'crypto';
import { AuthChallengePurpose, type AuthChallenge } from '@prisma/client';
import nodemailer from 'nodemailer';
import { prisma } from './db';
import { hashPassword, verifyPassword } from './password';

export const authCodeLength = 6;
const authCodeMaxAttempts = 5;
const authCodeTtlMinutes = 10;

export class AuthCodeDeliveryError extends Error {
  constructor() {
    super('Auth code delivery is not configured.');
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

function shouldExposeDevelopmentCode() {
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
  const expiresAt = new Date(Date.now() + authCodeTtlMinutes * 60 * 1000);

  await prisma.authChallenge.deleteMany({
    where: {
      email: normalisedEmail,
      purpose,
      consumedAt: null,
    },
  });

  const challenge = await prisma.authChallenge.create({
    data: {
      email: normalisedEmail,
      purpose,
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
  });

  try {
    await deliverAuthCode(normalisedEmail, code, purpose);
  } catch (error) {
    await prisma.authChallenge.deleteMany({
      where: { id: challenge.id },
    });

    throw error;
  }

  return {
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt,
    devCode: shouldExposeDevelopmentCode() ? code : undefined,
  };
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
    data: { consumedAt: new Date() },
  });

  return result.count === 1;
}
