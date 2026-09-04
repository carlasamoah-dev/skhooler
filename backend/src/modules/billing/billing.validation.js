/**
 * Billing Validation Schemas
 */
import { z } from 'zod'

export const dummyMembershipCheckoutSchema = z.object({
  groupId: z.string().uuid(),
  tierId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD')
})

export const dummyPlatformCheckoutSchema = z.object({
  planId: z.string().uuid(),
  amount: z.number().positive(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY')
})
