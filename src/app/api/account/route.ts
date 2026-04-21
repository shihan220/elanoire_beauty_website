import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/server/auth';
import { prisma } from '@/server/db';

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        authenticated: false,
        profile: null,
        orders: [],
        addresses: [],
      },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      },
      addresses: {
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        authenticated: false,
        profile: null,
        orders: [],
        addresses: [],
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    profile: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    orders: user.orders,
    addresses: user.addresses,
    settings: {
      newsletter: false,
      orderUpdates: true,
      earlyAccess: false,
    },
  });
}
