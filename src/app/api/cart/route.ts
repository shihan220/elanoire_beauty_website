import { NextResponse } from 'next/server';
import { calculateCartSummary, type CartRequestItem } from '@/server/cart';

type CartRequestBody = {
  items?: CartRequestItem[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as CartRequestBody;
  const items = Array.isArray(body.items) ? body.items : [];

  return NextResponse.json(calculateCartSummary(items));
}
