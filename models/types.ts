export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
}

export type SearchJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SearchJobInput {
  locationName: string;
  latitude: number;
  longitude: number;
  radius: number;
  category: string;
  keywords?: string;
  requireNoWebsite: boolean;
}

export interface SearchJob extends SearchJobInput {
  id: string;
  userId: string;
  status: SearchJobStatus;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface Business {
  id: string;
  placeId: string;
  name: string;
  normalizedName: string;
  category: string;
  address: string;
  normalizedAddress: string;
  city: string;
  region: string;
  phone: string;
  websiteUrl: string | null;
  mapsUrl: string;
  rating: number | null;
  reviewCount: number;
  openingStatus: string | null;
  openNow: boolean | null;
  latitude: number;
  longitude: number;
  confidenceScore: number;
  confidenceLabel: 'high' | 'medium' | 'low';
  sourceMetadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchJobBusiness {
  id: string;
  searchJobId: string;
  businessId: string;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  payload: SearchJobInput;
  createdAt: string;
}

export interface ExportRecord {
  id: string;
  userId: string;
  searchJobId: string;
  filters: Record<string, string | number | boolean | undefined>;
  rowCount: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
}
