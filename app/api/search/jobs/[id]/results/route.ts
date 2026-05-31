import { NextRequest } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { getSearchJobResults } from '@/services/searchService';
import { filterBusinesses } from '@/utils/filter';
import { parseOptionalBoolean } from '@/utils/params';
import { fail, ok } from '@/utils/response';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { id } = await context.params;
  const job = db.searchJobs.find((item) => item.id === id && item.userId === auth.user.sub);
  if (!job) return fail('Search job not found', 404);

  const params = request.nextUrl.searchParams;
  const requireNoWebsiteParam = params.get('requireNoWebsite');
  const results = filterBusinesses(getSearchJobResults(id), {
    category: params.get('category') ?? undefined,
    city: params.get('city') ?? undefined,
    region: params.get('region') ?? undefined,
    confidence: params.get('confidence') ? Number(params.get('confidence')) : undefined,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    openNow: parseOptionalBoolean(params.get('openNow')),
    requireNoWebsite: requireNoWebsiteParam ? requireNoWebsiteParam === 'true' : true,
  });

  return ok(results);
}
