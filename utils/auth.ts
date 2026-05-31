import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserRole } from '@/models/types';

function getSecret() {
  const jwtSecret = process.env.JWT_SECRET;
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  if (!jwtSecret && isProduction) {
    throw new Error('JWT_SECRET must be set in production');
  }
  return new TextEncoder().encode(jwtSecret ?? 'local-dev-secret-only');
}
const accessCookieName = 'tp_access';

interface TokenPayload extends JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export async function signAccessToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
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
