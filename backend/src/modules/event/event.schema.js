import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().max(10000).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  startDate: z.string().datetime().or(z.string()),
  endDate: z.string().datetime().or(z.string()).optional().nullable(),
  timezone: z.string().optional().default('UTC'),
  isAllDay: z.boolean().optional().default(false),
  locationType: z.enum(['ONLINE_LINK', 'PHYSICAL_ADDRESS', 'RECORDED_SESSION']).default('ONLINE_LINK'),
  locationUrl: z.string().url().optional().nullable(),
  locationAddress: z.string().max(300).optional().nullable(),
  accessType: z.enum(['ALL_MEMBERS', 'TIER_LOCKED']).default('ALL_MEMBERS'),
  requiredTierId: z.string().uuid().optional().nullable(),
  isRecurring: z.boolean().optional().default(false),
  recurrenceRule: z.string().max(100).optional().nullable()
});

export const updateEventSchema = createEventSchema.partial().extend({
  recordingUrl: z.string().url().optional().nullable(),
  isCancelled: z.boolean().optional()
});

export const eventRsvpSchema = z.object({
  status: z.enum(['GOING', 'MAYBE', 'NOT_GOING'])
});

export const eventsQuerySchema = z.object({
  startAfter: z.string().optional(),
  startBefore: z.string().optional(),
  filter: z.enum(['upcoming', 'past', 'all']).optional().default('upcoming'),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50)
});
