import { requireAuth } from '@/middleware/authGuard';
import { ok } from '@/utils/response';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;
  return ok(auth.user);
}
