import { NextRequest } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { fail, ok } from '@/utils/response';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;
  const item = db.exports.find((entry) => entry.id === id && entry.userId === auth.user.sub);
  if (!item) return fail('Export not found', 404);

  return ok(item);
}
