import { Business } from '@/models/types';

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
    if (filters.city && business.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.region && business.region.toLowerCase() !== filters.region.toLowerCase()) return false;
    if (filters.minRating && (business.rating ?? 0) < filters.minRating) return false;
    if (filters.openNow && business.openNow !== true) return false;
    if (filters.requireNoWebsite && business.websiteUrl) return false;
    return true;
  });
}
