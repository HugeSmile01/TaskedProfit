import { Business } from '@/models/types';

export const normalizeText = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

export function deduplicateBusinesses(businesses: Business[]): Business[] {
  const seen = new Set<string>();
  return businesses.filter((business) => {
    const key = `${business.placeId}|${normalizeText(business.name)}|${normalizeText(business.address)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
