import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(5000).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional().default(false),
  accessType: z.enum(['OPEN', 'TIER_LOCKED', 'PRIVATE_GRANT']).default('OPEN'),
  requiredTierId: z.string().uuid().optional().nullable()
});

export const updateCourseSchema = createCourseSchema.partial();

export const createModuleSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional().nullable(),
  isPublished: z.boolean().optional().default(false)
});

export const updateModuleSchema = createModuleSchema.partial();

export const createLessonSchema = z.object({
  title: z.string().min(1).max(150),
  content: z.string().optional().nullable(),
  videoAssetId: z.string().max(100).optional().nullable(),
  videoPlaybackId: z.string().max(100).optional().nullable(),
  videoDurationSeconds: z.number().int().positive().optional().nullable(),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      size: z.number(),
      type: z.string()
    })
  ).optional().nullable(),
  isPublished: z.boolean().optional().default(false),
  isFreePreview: z.boolean().optional().default(false)
});

export const updateLessonSchema = createLessonSchema.partial();

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1)
});

export const updateProgressSchema = z.object({
  isCompleted: z.boolean().optional(),
  lastPositionSeconds: z.number().int().min(0).optional()
});

export const grantAccessSchema = z.object({
  userId: z.string().uuid()
});
