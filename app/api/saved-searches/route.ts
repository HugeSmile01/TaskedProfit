import { NextRequest } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { fail, ok } from '@/utils/response';
import { savedSearchSchema } from '@/utils/validation';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const parsed = savedSearchSchema.safeParse(await request.json());
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload');

  const item = {
    id: crypto.randomUUID(),
    userId: auth.user.sub,
    name: parsed.data.name,
    payload: parsed.data.payload,
    createdAt: new Date().toISOString(),
  };

  db.savedSearches.push(item);
  return ok(item, 201);
}

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  return ok(db.savedSearches.filter((item) => item.userId === auth.user.sub));
}
