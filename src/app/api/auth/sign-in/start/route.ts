import { AuthChallengePurpose } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthCodeCooldownError, AuthCodeDeliveryError, cleanupExpiredAuthChallenges, createAuthChallenge, hasDatabaseConfig, normaliseEmail } from '@/server/auth-challenges';
import { minimumPasswordLength, verifyPassword } from '@/server/password';
import { prisma } from '@/server/db';

const signInStartSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(minimumPasswordLength, 'Use at least 8 characters.'),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown sign-in error';
}

export async function POST(request: Request) {
  const result = signInStartSchema.safeParse(await request.json().catch(() => null));

  if (!result.success) {
    return NextResponse.json(
      { message: 'Invalid sign-in details.', errors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { message: 'Account sign-in is not configured yet. Add DATABASE_URL and run the Prisma setup.' },
      { status: 503 },
    );
  }

  const email = normaliseEmail(result.data.email);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    if (!user || !(await verifyPassword(result.data.password, user.passwordHash))) {
      return NextResponse.json(
        { message: 'We could not sign you in with those details.' },
        { status: 401 },
      );
    }

    await cleanupExpiredAuthChallenges();

    const challenge = await createAuthChallenge({
      email,
      purpose: AuthChallengePurpose.SIGN_IN,
    });

    return NextResponse.json({
      message: 'Enter the verification code to finish signing in.',
      ...challenge,
    }, { status: 202 });
  } catch (error) {
    if (error instanceof AuthCodeDeliveryError) {
      return NextResponse.json(
        { message: 'Account verification email is not configured yet.' },
        { status: 503 },
      );
    }

    if (error instanceof AuthCodeCooldownError) {
      return NextResponse.json(
        {
          message: error.message,
          retryAfterSeconds: error.retryAfterSeconds,
          retryAt: error.retryAt,
        },
        {
          status: 429,
          headers: {
            'Retry-After': error.retryAfterSeconds.toString(),
          },
        },
      );
    }

    console.error('Sign-in challenge creation failed.', {
      email,
      error: getErrorMessage(error),
    });

    return NextResponse.json(
      { message: 'Account sign-in is unavailable. Check database configuration and try again.' },
      { status: 503 },
    );
  }
}
