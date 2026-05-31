import { db } from '@/models/store';
import { Business, SearchJob, SearchJobInput } from '@/models/types';
import { scoreBusinessConfidence } from '@/utils/confidence';
import { deduplicateBusinesses, normalizeText } from '@/utils/dedupe';
import { filterBusinesses } from '@/utils/filter';

const now = () => new Date().toISOString();

export function createSearchJob(userId: string, payload: SearchJobInput): SearchJob {
  const searchJob: SearchJob = {
    id: crypto.randomUUID(),
    userId,
    status: 'pending',
    createdAt: now(),
    updatedAt: now(),
    ...payload,
  };

  db.searchJobs.push(searchJob);
  return searchJob;
}

export function runSearchJob(searchJobId: string): SearchJob | null {
  const job = db.searchJobs.find((searchJob) => searchJob.id === searchJobId);
  if (!job) return null;

  job.status = 'processing';
  job.updatedAt = now();

  const candidates = db.businesses
    .filter((business) => business.category.toLowerCase().includes(job.category.toLowerCase()))
    .map((business): Business => {
      const confidence = scoreBusinessConfidence(business);
      return {
        ...business,
        normalizedName: normalizeText(business.name),
        normalizedAddress: normalizeText(business.address),
        confidenceScore: confidence.score,
        confidenceLabel: confidence.label,
      };
    });

  const filtered = filterBusinesses(candidates, {
    category: job.category,
    requireNoWebsite: job.requireNoWebsite,
  });

  const deduped = deduplicateBusinesses(filtered);

  db.searchJobBusinesses = db.searchJobBusinesses.filter((row) => row.searchJobId !== job.id);
  deduped.forEach((business) => {
    db.searchJobBusinesses.push({
      id: crypto.randomUUID(),
      searchJobId: job.id,
      businessId: business.id,
      createdAt: now(),
    });
  });

  job.status = 'completed';
  job.updatedAt = now();
  return job;
}

export function getSearchJobResults(searchJobId: string) {
  const businessIds = db.searchJobBusinesses
    .filter((row) => row.searchJobId === searchJobId)
    .map((row) => row.businessId);
  return db.businesses.filter((business) => businessIds.includes(business.id));
}
