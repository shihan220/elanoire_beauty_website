import { AuthChallengePurpose } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { AuthCodeDeliveryError, createAuthChallenge, hasDatabaseConfig, normaliseEmail } from '@/server/auth-challenges';
import { hashPassword, minimumPasswordLength } from '@/server/password';

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(minimumPasswordLength, 'Use at least 8 characters.'),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown registration error';
}

export async function POST(request: Request) {
  const result = registerSchema.safeParse(await request.json().catch(() => null));

  if (!result.success) {
    return NextResponse.json(
      { message: 'Invalid registration details.', errors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { message: 'Account creation is not configured yet. Add DATABASE_URL and run the Prisma setup.' },
      { status: 503 },
    );
  }

  const { firstName, lastName, email, password } = result.data;
  const normalisedEmail = normaliseEmail(email);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalisedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account already exists for this email address.' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const challenge = await createAuthChallenge({
      email: normalisedEmail,
      purpose: AuthChallengePurpose.SIGN_UP,
      firstName,
      lastName,
      passwordHash,
    });

    return NextResponse.json({
      message: 'Enter the verification code to finish creating your account.',
      ...challenge,
    }, { status: 202 });
  } catch (error) {
    console.error('Registration challenge creation failed.', {
      email: normalisedEmail,
      error: getErrorMessage(error),
    });

    if (error instanceof AuthCodeDeliveryError) {
      return NextResponse.json(
        { message: 'Account verification email is not configured yet.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { message: 'Account creation is unavailable. Check database configuration and try again.' },
      { status: 503 },
    );
  }
}
