import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { AUTH_COOKIE, signAccessToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;

  const token = await signAccessToken({ sub: auth.user.sub, email: auth.user.email, role: auth.user.role });
  const response = NextResponse.json({ data: { refreshed: true } });
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15,
  });
  return response;
}
