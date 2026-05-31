import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const searchJobSchema = z.object({
  locationName: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().int().min(1).max(50000),
  category: z.string().min(2),
  keywords: z.string().max(100).optional(),
  requireNoWebsite: z.boolean().default(true),
});

export const businessPatchSchema = z.object({
  category: z.string().min(2).optional(),
  websiteUrl: z.string().url().nullable().optional(),
  openingStatus: z.string().min(2).nullable().optional(),
});

export const exportSchema = z.object({
  searchJobId: z.string().min(1),
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});

export const savedSearchSchema = z.object({
  name: z.string().min(2),
  payload: searchJobSchema,
});
