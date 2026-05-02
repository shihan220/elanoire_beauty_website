import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/server/auth';
import { listAccountAddresses } from '@/server/account';
import { accountAddressSchema, formatAccountValidationErrors } from '@/server/account-schemas';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Please sign in to manage saved addresses.' }, { status: 401 });
  }

  const parsedBody = accountAddressSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: 'Review the address details and try again.',
        errors: formatAccountValidationErrors(parsedBody.error),
      },
      { status: 400 },
    );
  }

  const data = parsedBody.data;
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      const addressCount = await tx.address.count({
        where: { userId },
      });
      const shouldBeDefault = data.isDefault || addressCount === 0;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      await tx.address.create({
        data: {
          userId,
          label: data.label,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber || null,
          line1: data.line1,
          line2: data.line2 || null,
          city: data.city,
          state: data.state || null,
          postcode: data.postcode,
          country: data.country,
          isDefault: shouldBeDefault,
        },
      });
    });
  } catch (error) {
    console.error('Address creation failed.', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { message: 'The address could not be saved right now.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    addresses: await listAccountAddresses(userId),
  });
}
