import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreBusinessConfidence } from '@/utils/confidence';

test('scoreBusinessConfidence returns high score for complete business', () => {
  const score = scoreBusinessConfidence({
    placeId: 'place123',
    address: '123 Main Street, Springfield',
    phone: '+1-555-123-4567',
    openingStatus: 'OPERATIONAL',
    rating: 4.5,
    reviewCount: 100,
  });

  assert.equal(score.score, 100);
  assert.equal(score.label, 'high');
});

test('scoreBusinessConfidence returns low score for sparse business', () => {
  const score = scoreBusinessConfidence({
    placeId: '',
    address: 'x',
    phone: 'bad',
    openingStatus: null,
    rating: null,
    reviewCount: 0,
  });

  assert.equal(score.label, 'low');
});
