import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    authenticated: false,
    user: null,
    message: 'Session endpoint is ready for auth provider integration.',
  });
}
