import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/authGuard';
import { db } from '@/models/store';
import { getSearchJobResults } from '@/services/searchService';
import { businessesToCsv } from '@/utils/csv';
import { normalizeExportFilters } from '@/utils/exportFilters';
import { filterBusinesses } from '@/utils/filter';
import { fail, ok } from '@/utils/response';
import { exportSchema } from '@/utils/validation';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const parsed = exportSchema.safeParse(await request.json());
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload');

  const { searchJobId, filters } = parsed.data;
  const job = db.searchJobs.find((item) => item.id === searchJobId && item.userId === auth.user.sub);
  if (!job) return fail('Search job not found', 404);

  const results = filterBusinesses(getSearchJobResults(searchJobId), {
    category: filters.category as string | undefined,
    city: filters.city as string | undefined,
    region: filters.region as string | undefined,
    confidence: typeof filters.confidence === 'number' ? filters.confidence : undefined,
    minRating: typeof filters.minRating === 'number' ? filters.minRating : undefined,
    openNow: typeof filters.openNow === 'boolean' ? filters.openNow : undefined,
    requireNoWebsite: typeof filters.requireNoWebsite === 'boolean' ? filters.requireNoWebsite : true,
  });

  const normalizedFilters = normalizeExportFilters(filters);

  const exportRecord = {
    id: crypto.randomUUID(),
    userId: auth.user.sub,
    searchJobId,
    filters: normalizedFilters,
    rowCount: results.length,
    createdAt: new Date().toISOString(),
  };
  db.exports.push(exportRecord);

  const csv = businessesToCsv(results);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="taskedprofit-export-${exportRecord.id}.csv"`,
    },
  });
}

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  return ok(db.exports.filter((item) => item.userId === auth.user.sub));
}
