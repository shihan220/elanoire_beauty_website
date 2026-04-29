import { NextResponse } from 'next/server';
import { archiveAdminProduct, updateAdminProduct } from '@/server/admin/catalog';
import { requireAdminSession } from '@/server/admin/auth';
import { formatAdminValidationErrors, partialAdminProductSchema } from '@/server/admin/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const adminSession = await requireAdminSession();
  if (!adminSession) {
    return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 });
  }

  const { productId } = await params;
  const parsedBody = partialAdminProductSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: 'Review the product details and try again.',
        errors: formatAdminValidationErrors(parsedBody.error),
      },
      { status: 400 },
    );
  }

  const product = await updateAdminProduct(productId, parsedBody.data);
  if (!product) {
    return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const adminSession = await requireAdminSession();
  if (!adminSession) {
    return NextResponse.json({ message: 'Admin authentication required.' }, { status: 401 });
  }

  const { productId } = await params;
  const product = await archiveAdminProduct(productId);

  if (!product) {
    return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  }

  return NextResponse.json({ product });
}
