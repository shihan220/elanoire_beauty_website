import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/server/auth';
import { listAccountAddresses } from '@/server/account';
import { accountAddressSchema, formatAccountValidationErrors } from '@/server/account-schemas';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    addressId: string;
  }>;
};

async function getOwnedAddress(userId: string, addressId: string) {
  return prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Please sign in to manage saved addresses.' }, { status: 401 });
  }

  const { addressId } = await params;
  const existingAddress = await getOwnedAddress(session.user.id, addressId);

  if (!existingAddress) {
    return NextResponse.json({ message: 'Address not found.' }, { status: 404 });
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
      const shouldBeDefault = data.isDefault || existingAddress.isDefault;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: {
            userId,
            id: { not: addressId },
          },
          data: { isDefault: false },
        });
      }

      await tx.address.update({
        where: { id: addressId },
        data: {
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
    console.error('Address update failed.', {
      userId,
      addressId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { message: 'The address could not be updated right now.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    addresses: await listAccountAddresses(userId),
  });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Please sign in to manage saved addresses.' }, { status: 401 });
  }

  const { addressId } = await params;
  const existingAddress = await getOwnedAddress(session.user.id, addressId);

  if (!existingAddress) {
    return NextResponse.json({ message: 'Address not found.' }, { status: 404 });
  }

  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id: addressId },
      });

      if (existingAddress.isDefault) {
        const fallbackAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: [{ createdAt: 'desc' }],
        });

        if (fallbackAddress) {
          await tx.address.update({
            where: { id: fallbackAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });
  } catch (error) {
    console.error('Address deletion failed.', {
      userId,
      addressId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { message: 'The address could not be removed right now.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    addresses: await listAccountAddresses(userId),
  });
}
