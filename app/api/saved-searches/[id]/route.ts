import { NextRequest } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { fail, ok } from '@/utils/response';

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;

  const { id } = await context.params;
  const index = db.savedSearches.findIndex((item) => item.id === id && item.userId === auth.user.sub);
  if (index === -1) return fail('Saved search not found', 404);

  db.savedSearches.splice(index, 1);
  return ok({ deleted: true });
}
