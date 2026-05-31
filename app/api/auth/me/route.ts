import { NextRequest } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { ok } from '@/utils/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  return ok(auth.user);
}
