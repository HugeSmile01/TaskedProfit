import { Business } from '@/models/types';

const headers = [
  'name',
  'category',
  'address',
  'phone',
  'mapsUrl',
  'rating',
  'reviewCount',
  'openingStatus',
  'latitude',
  'longitude',
  'confidenceScore',
  'confidenceLabel',
];

const esc = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;

export function businessesToCsv(businesses: Business[]): string {
  const rows = businesses.map((business) =>
    [
      business.name,
      business.category,
      business.address,
      business.phone,
      business.mapsUrl,
      business.rating ?? '',
      business.reviewCount,
      business.openingStatus ?? '',
      business.latitude,
      business.longitude,
      business.confidenceScore,
      business.confidenceLabel,
    ]
      .map(esc)
      .join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}
