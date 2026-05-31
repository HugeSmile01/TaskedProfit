import { Business } from '@/models/types';
import { normalizeText } from '@/utils/dedupe';

export interface BusinessFilters {
  category?: string;
  confidence?: number;
  city?: string;
  region?: string;
  minRating?: number;
  openNow?: boolean;
  requireNoWebsite?: boolean;
}

export function filterBusinesses(businesses: Business[], filters: BusinessFilters): Business[] {
  return businesses.filter((business) => {
    if (filters.category && business.category !== filters.category) return false;
    if (filters.confidence && business.confidenceScore < filters.confidence) return false;
    if (filters.city && normalizeText(business.city) !== normalizeText(filters.city)) return false;
    if (filters.region && normalizeText(business.region) !== normalizeText(filters.region)) return false;
    if (filters.minRating && (business.rating ?? 0) < filters.minRating) return false;
    if (typeof filters.openNow === 'boolean' && business.openNow !== filters.openNow) return false;
    if (filters.requireNoWebsite && business.websiteUrl) return false;
    return true;
  });
}
