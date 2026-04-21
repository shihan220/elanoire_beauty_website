import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    authenticated: false,
    profile: null,
    orders: [],
    addresses: [],
    settings: {
      newsletter: false,
      orderUpdates: true,
      earlyAccess: false,
    },
    message: 'Account API structure is ready for authenticated user data.',
  });
}
