import { getAuthUser } from '@/utils/auth';
import { fail } from '@/utils/response';

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) return { error: fail('Unauthorized', 401) };
  return { user };
}

export async function requireRole(role: 'admin' | 'user') {
  const auth = await requireAuth();
  if ('error' in auth) return auth;
  if (auth.user.role !== role && auth.user.role !== 'admin') {
    return { error: fail('Forbidden', 403) };
  }
  return auth;
}
