import { Business } from '@/models/types';

type ConfidenceLabel = 'high' | 'medium' | 'low';
const PHONE_NUMBER_PATTERN = /^\+?[\d\-\s().]{7,}$/;
const hasEnoughDigits = (value: string) => (value.match(/\d/g) ?? []).length >= 7;

export function scoreBusinessConfidence(business: Pick<Business, 'placeId' | 'address' | 'phone' | 'openingStatus' | 'rating' | 'reviewCount'>) {
  let score = 0;

  if (business.placeId) score += 25;
  if (business.address.length > 10) score += 20;
  if (PHONE_NUMBER_PATTERN.test(business.phone) && hasEnoughDigits(business.phone)) score += 15;
  if (business.openingStatus) score += 10;

  if (business.rating !== null && business.rating >= 1 && business.rating <= 5) {
    score += 15;
  }

  if (business.reviewCount > 0) {
    score += 15;
  }

  score = Math.max(0, Math.min(100, score));

  const label: ConfidenceLabel = score >= 90 ? 'high' : score >= 75 ? 'medium' : 'low';
  return { score, label };
}
