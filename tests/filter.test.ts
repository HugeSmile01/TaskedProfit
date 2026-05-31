import assert from 'node:assert/strict';
import test from 'node:test';
import { filterBusinesses } from '@/utils/filter';
import { Business } from '@/models/types';

const business = {
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

test('filterBusinesses filters by category and no website', () => {
  const result = filterBusinesses([business], { category: 'Bakery', requireNoWebsite: true });
  assert.equal(result.length, 1);
});

test('filterBusinesses filters open now', () => {
  const result = filterBusinesses([business], { openNow: true });
  assert.equal(result.length, 1);
});
