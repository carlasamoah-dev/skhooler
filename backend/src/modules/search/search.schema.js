/**
 * @file search.schema.js
 * Zod validation schemas for search endpoints.
 */

import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['all', 'posts', 'courses', 'lessons', 'events', 'members']).optional().default('all'),
  limit: z.coerce.number().min(1).max(50).default(20),
});
