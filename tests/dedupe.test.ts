import assert from 'node:assert/strict';
import test from 'node:test';
import { deduplicateBusinesses } from '@/utils/dedupe';
import { Business } from '@/models/types';

const base = {
  id: '1',
  placeId: 'p1',
  name: 'Alpha Bakery',
  normalizedName: 'alpha bakery',
  category: 'Bakery',
  address: '123 Main St',
  normalizedAddress: '123 main st',
  city: 'Springfield',
  region: 'IL',
  phone: '+1-555-1234',
  websiteUrl: null,
  mapsUrl: 'https://maps.google.com',
  rating: 4.6,
  reviewCount: 10,
  openingStatus: 'OPERATIONAL',
  openNow: true,
  latitude: 0,
  longitude: 0,
  confidenceScore: 90,
  confidenceLabel: 'high',
  sourceMetadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} satisfies Business;

test('deduplicateBusinesses removes duplicates', () => {
  const input = [base, { ...base, id: '2' }];
  const deduped = deduplicateBusinesses(input);
  assert.equal(deduped.length, 1);
});
