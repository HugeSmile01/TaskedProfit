import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserRole } from '@/models/types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-only-secret-change-me');
const accessCookieName = 'tp_access';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export async function signAccessToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as TokenPayload;
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(accessCookieName)?.value;
  if (!token) return null;

  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export const AUTH_COOKIE = accessCookieName;
