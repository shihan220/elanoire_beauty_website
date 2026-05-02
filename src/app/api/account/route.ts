import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getCurrentSession } from '@/server/auth';
import { getAccountDashboardData } from '@/server/account';
import { accountProfileSchema, formatAccountValidationErrors } from '@/server/account-schemas';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthenticatedResponse() {
  return NextResponse.json(
    {
      authenticated: false,
      profile: null,
      orders: [],
      addresses: [],
      settings: null,
    },
    { status: 401 },
  );
}

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return unauthenticatedResponse();
  }

  const accountData = await getAccountDashboardData(session.user.id);

  if (!accountData) {
    return unauthenticatedResponse();
  }

  return NextResponse.json({
    authenticated: true,
    ...accountData,
  });
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return unauthenticatedResponse();
  }

  const parsedBody = accountProfileSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: 'Review your details and try again.',
        errors: formatAccountValidationErrors(parsedBody.error),
      },
      { status: 400 },
    );
  }

  const data = parsedBody.data;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        {
          message: 'That email address is already connected to another account.',
          errors: {
            email: 'Use a different email address.',
          },
        },
        { status: 409 },
      );
    }

    console.error('Account profile update failed.', {
      userId: session.user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { message: 'Your profile could not be updated right now.' },
      { status: 500 },
    );
  }

  const accountData = await getAccountDashboardData(session.user.id);

  if (!accountData) {
    return unauthenticatedResponse();
  }

  return NextResponse.json({
    authenticated: true,
    profile: accountData.profile,
  });
}
