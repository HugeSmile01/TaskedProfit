import { NextRequest } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { createSearchJob } from '@/services/searchService';
import { fail, ok } from '@/utils/response';
import { searchJobSchema } from '@/utils/validation';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const body = await request.json();
  const parsed = searchJobSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    return fail(details || 'Invalid payload');
  }

  const job = createSearchJob(auth.user.sub, parsed.data);
  return ok(job, 201);
}

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const jobs = db.searchJobs.filter((job) => job.userId === auth.user.sub);
  return ok(jobs);
}
