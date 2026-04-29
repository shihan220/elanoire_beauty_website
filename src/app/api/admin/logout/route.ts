import { NextResponse } from 'next/server';
import { adminSessionCookieName, getAdminSessionCookieOptions } from '@/server/admin/auth';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookieName, '', {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
