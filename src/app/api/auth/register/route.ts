import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
});

export async function POST(request: Request) {
  const result = registerSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json(
      { message: 'Invalid registration details.', errors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, password } = result.data;
  const normalisedEmail = email.toLowerCase();

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

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: normalisedEmail,
      passwordHash,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
