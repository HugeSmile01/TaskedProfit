import { AuditLog, Business, ExportRecord, SavedSearch, SearchJob, SearchJobBusiness, User } from '@/models/types';

const now = () => new Date().toISOString();

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const seedBusinesses: Business[] = [
  {
    id: 'biz-1',
    placeId: 'place_1',
    name: 'Sunrise Bakery',
    normalizedName: normalize('Sunrise Bakery'),
    category: 'Bakery',
    address: '123 Main St, Springfield',
    normalizedAddress: normalize('123 Main St, Springfield'),
    city: 'Springfield',
    region: 'IL',
    phone: '+1-555-123-4567',
    websiteUrl: null,
    mapsUrl: 'https://maps.google.com/?q=Sunrise+Bakery',
    rating: 4.7,
    reviewCount: 120,
    openingStatus: 'OPERATIONAL',
    openNow: true,
    latitude: 39.799,
    longitude: -89.644,
    confidenceScore: 92,
    confidenceLabel: 'high',
    sourceMetadata: { source: 'google-places-mock' },
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'biz-2',
    placeId: 'place_2',
    name: 'Green Leaf Florist',
    normalizedName: normalize('Green Leaf Florist'),
    category: 'Florist',
    address: '456 Oak Ave, Springfield',
    normalizedAddress: normalize('456 Oak Ave, Springfield'),
    city: 'Springfield',
    region: 'IL',
    phone: '+1-555-987-6543',
    websiteUrl: null,
    mapsUrl: 'https://maps.google.com/?q=Green+Leaf+Florist',
    rating: 4.5,
    reviewCount: 89,
    openingStatus: 'OPERATIONAL',
    openNow: false,
    latitude: 39.801,
    longitude: -89.641,
    confidenceScore: 85,
    confidenceLabel: 'medium',
    sourceMetadata: { source: 'google-places-mock' },
    createdAt: now(),
    updatedAt: now(),
  },
];

export const db = {
  users: [
    {
      id: 'user-1',
      email: 'admin@taskedprofit.local',
      name: 'Admin User',
      role: 'admin',
      passwordHash: '$2b$10$vsJA1rrhGoVyarZLZI5BFuPExY7fR42XnvYCXskoWtPCG.AHi4N8q',
    },
  ] as User[],
  searchJobs: [] as SearchJob[],
  businesses: seedBusinesses,
  searchJobBusinesses: [] as SearchJobBusiness[],
  savedSearches: [] as SavedSearch[],
  exports: [] as ExportRecord[],
  auditLogs: [] as AuditLog[],
};
