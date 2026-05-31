import { NextRequest } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { fail, ok } from '@/utils/response';
import { businessPatchSchema } from '@/utils/validation';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;
  const business = db.businesses.find((item) => item.id === id);
  if (!business) return fail('Business not found', 404);

  return ok(business);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;
  const business = db.businesses.find((item) => item.id === id);
  if (!business) return fail('Business not found', 404);

  const parsed = businessPatchSchema.safeParse(await request.json());
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload');

  Object.assign(business, parsed.data, { updatedAt: new Date().toISOString() });
  return ok(business);
}
