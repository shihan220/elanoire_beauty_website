import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/server/admin/auth';
import { createAdminNewsletterUpdate } from '@/server/admin/newsletter';
import { adminNewsletterSchema, formatAdminValidationErrors } from '@/server/admin/schemas';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const adminSession = await requireAdminSession();
  if (!adminSession) {
    return NextResponse.json({ message: 'Admin session required.' }, { status: 401 });
  }

  const parsedBody = adminNewsletterSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: 'Review the newsletter details and try again.',
        errors: formatAdminValidationErrors(parsedBody.error),
      },
      { status: 400 },
    );
  }

  const update = await createAdminNewsletterUpdate(parsedBody.data);

  return NextResponse.json({ update });
}
