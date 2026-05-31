import { NextRequest } from 'next/server';
import { getAuthUser } from '@/utils/auth';
import { fail } from '@/utils/response';

export async function requireAuth(_request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return { error: fail('Unauthorized', 401) };
  return { user };
}

export async function requireRole(request: NextRequest, role: 'admin' | 'user') {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth;
  if (auth.user.role !== role && auth.user.role !== 'admin') {
    return { error: fail('Forbidden', 403) };
  }
  return auth;
}
