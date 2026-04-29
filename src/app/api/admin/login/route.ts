import { NextResponse } from 'next/server';
import { adminSessionCookieName, createAdminSessionToken, getAdminCredentialConfig, getAdminSessionCookieOptions, validateAdminCredentials } from '@/server/admin/auth';
import { adminLoginSchema, formatAdminValidationErrors } from '@/server/admin/schemas';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const parsedBody = adminLoginSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: 'Enter valid admin credentials.',
        errors: formatAdminValidationErrors(parsedBody.error),
      },
      { status: 400 },
    );
  }

  const { email, password } = parsedBody.data;

  if (!validateAdminCredentials(email, password)) {
    return NextResponse.json(
      { message: 'Admin access could not be granted with those details.' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    mode: getAdminCredentialConfig().mode,
  });

  response.cookies.set(
    adminSessionCookieName,
    createAdminSessionToken(email.trim().toLowerCase()),
    getAdminSessionCookieOptions(),
  );

  return response;
}
