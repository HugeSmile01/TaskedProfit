import { NextRequest } from 'next/server';
import { requireRole } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { ok } from '@/utils/response';

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, 'admin');
  if ('error' in auth) return auth.error;

  return ok(db.auditLogs);
}
