import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/server/admin/auth';
import { deleteAdminNewsletterUpdate, updateAdminNewsletterUpdate } from '@/server/admin/newsletter';
import { formatAdminValidationErrors, partialAdminNewsletterSchema } from '@/server/admin/schemas';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    newsletterId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const adminSession = await requireAdminSession();
  if (!adminSession) {
    return NextResponse.json({ message: 'Admin session required.' }, { status: 401 });
  }

  const parsedBody = partialAdminNewsletterSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: 'Review the newsletter details and try again.',
        errors: formatAdminValidationErrors(parsedBody.error),
      },
      { status: 400 },
    );
  }

  const { newsletterId } = await params;
  const update = await updateAdminNewsletterUpdate(newsletterId, parsedBody.data);

  if (!update) {
    return NextResponse.json({ message: 'Newsletter entry not found.' }, { status: 404 });
  }

  return NextResponse.json({ update });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const adminSession = await requireAdminSession();
  if (!adminSession) {
    return NextResponse.json({ message: 'Admin session required.' }, { status: 401 });
  }

  const { newsletterId } = await params;
  const update = await deleteAdminNewsletterUpdate(newsletterId);

  if (!update) {
    return NextResponse.json({ message: 'Newsletter entry not found.' }, { status: 404 });
  }

  return NextResponse.json({ update });
}
