import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/utils/auth';

export async function POST() {
  const response = NextResponse.json({ data: { success: true } });
  response.cookies.set(AUTH_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
