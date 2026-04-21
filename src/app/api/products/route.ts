import { NextResponse } from 'next/server';
import { listProducts } from '@/server/products';

export async function GET() {
  const products = await listProducts();

  return NextResponse.json({
    products,
  });
}
