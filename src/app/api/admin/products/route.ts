import { NextResponse } from 'next/server';
import { createAdminProduct, listAdminProducts } from '@/server/admin/catalog';
import { requireAdminSession } from '@/server/admin/auth';
import { adminProductSchema, formatAdminValidationErrors } from '@/server/admin/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const adminSession = await requireAdminSession();
  if (!adminSession) {
    return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 });
  }

  return NextResponse.json(await listAdminProducts());
}

export async function POST(request: Request) {
  const adminSession = await requireAdminSession();
  if (!adminSession) {
    return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 });
  }

  const parsedBody = adminProductSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: 'Review the product details and try again.',
        errors: formatAdminValidationErrors(parsedBody.error),
      },
      { status: 400 },
    );
  }

  const product = await createAdminProduct(parsedBody.data);

  return NextResponse.json({ product }, { status: 201 });
}
