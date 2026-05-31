import { NextRequest } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { runSearchJob } from '@/services/searchService';
import { fail, ok } from '@/utils/response';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;

  const { id } = await context.params;
  const job = db.searchJobs.find((item) => item.id === id && item.userId === auth.user.sub);
  if (!job) return fail('Search job not found', 404);

  const updated = runSearchJob(id);
  if (!updated) return fail('Search job could not be run', 400);
  return ok(updated);
}
