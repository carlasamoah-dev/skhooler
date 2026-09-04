import { z } from 'zod';

/**
 * Analytics and Admin Dashboard related validation schemas
 */

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  interval: z.enum(['day', 'week', 'month']).optional().default('day'),
});
