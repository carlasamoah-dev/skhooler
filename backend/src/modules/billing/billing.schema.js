import { z } from 'zod';

export const membershipCheckoutSchema = z.object({
  groupSlug: z.string().min(1, 'Group slug is required'),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  returnUrl: z.string().url('Invalid return URL').optional(),
});

export const platformCheckoutSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  returnUrl: z.string().url('Invalid return URL').optional(),
});

export const dummyMembershipCheckoutSchema = z.object({
  groupSlug: z.string().min(1, 'Group slug is required'),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
});

export const dummyPlatformCheckoutSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid('Invalid subscription ID'),
});
