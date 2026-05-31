import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/models/store';
import { AUTH_COOKIE, signAccessToken } from '@/utils/auth';
import { fail } from '@/utils/response';
import { loginSchema } from '@/utils/validation';
import { checkRateLimit } from '@/middleware/rateLimit';

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'local';
  if (!checkRateLimit(`login:${ip}`, 10, 60_000)) return fail('Too many login attempts', 429);

  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid input');

  const { email, password } = parsed.data;
  const user = db.users.find((item) => item.email === email);
  if (!user) return fail('Invalid credentials', 401);

  const passwordValid = await compare(password, user.passwordHash);
  if (!passwordValid) return fail('Invalid credentials', 401);

  const token = await signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const response = NextResponse.json({ data: { id: user.id, email: user.email, role: user.role } });
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15,
  });

  return response;
}
