import { requireRole } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { ok } from '@/utils/response';

export async function GET() {
  const auth = await requireRole('admin');
  if ('error' in auth) return auth.error;

  return ok(db.auditLogs);
}
