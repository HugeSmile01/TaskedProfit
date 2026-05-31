import { NextRequest } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { filterBusinesses } from '@/utils/filter';
import { ok } from '@/utils/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;

  const params = request.nextUrl.searchParams;
  const filtered = filterBusinesses(db.businesses, {
    category: params.get('category') ?? undefined,
    confidence: params.get('confidence') ? Number(params.get('confidence')) : undefined,
    city: params.get('city') ?? undefined,
    region: params.get('region') ?? undefined,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    openNow: params.get('openNow') === 'true',
    requireNoWebsite: true,
  });

  return ok(filtered);
}
