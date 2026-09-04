/**
 * Integration validation schemas
 */
import { z } from 'zod'

export const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1)
})

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional()
})

export const createApiKeySchema = z.object({
  name: z.string().min(2).max(100)
})
