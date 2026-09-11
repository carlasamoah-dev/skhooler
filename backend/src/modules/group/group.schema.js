import { z } from 'zod'

// Group creation
export const createGroupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).optional().default([]),
  // Branding (optional — set during wizard)
  iconUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  // Pricing (optional — defaults to FREE)
  pricingModel: z.enum(['FREE', 'PAID']).default('FREE'),
  price: z.number().positive().max(9999.99).nullable().optional(),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']).nullable().optional(),
  trialDays: z.number().int().min(0).max(90).optional().default(0),
}).refine(data => {
  if (data.pricingModel === 'PAID' && (!data.price || !data.billingInterval)) return false
  return true
}, { message: 'Paid groups require price and billing interval' })

// Group update
export const updateGroupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000).nullable(),
  rules: z.string().trim().max(5000).nullable(),
  aboutContent: z.string().trim().max(10000).nullable(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  joinApproval: z.enum(['AUTOMATIC', 'MANUAL']),
  autoWelcomeMessage: z.string().trim().max(1000).nullable(),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).nullable(),
  iconUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/i, 'Slugs can only contain letters, numbers, and hyphens').optional(),
}).partial()

// Group pricing
export const updatePricingSchema = z.object({
  pricingModel: z.enum(['FREE', 'PAID']),
  price: z.number().positive().max(9999.99).nullable().optional(),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']).nullable().optional(),
  trialDays: z.number().int().min(0).max(90).optional(),
}).refine(data => {
  if (data.pricingModel === 'PAID' && (!data.price || !data.billingInterval)) {
    return false
  }
  return true
}, { message: 'Paid groups require price and billing interval' })

// Category
export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(50),
})
export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(50),
}).partial()
export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
})

// Member Tier
export const createTierSchema = z.object({
  name: z.string().trim().min(1).max(50),
})
export const updateTierSchema = z.object({
  name: z.string().trim().min(1).max(50),
}).partial()

// Membership Questions (batch set — replaces all questions)
export const setQuestionsSchema = z.object({
  questions: z.array(z.object({
    question: z.string().trim().min(1).max(500),
    isRequired: z.boolean().default(true),
  })).max(3),
})

// External Links
export const createLinkSchema = z.object({
  label: z.string().trim().min(1).max(100),
  url: z.string().url().max(2000),
})
export const updateLinkSchema = z.object({
  label: z.string().trim().min(1).max(100),
  url: z.string().url().max(2000),
}).partial()

// Member role change
export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER']),
})

// Member tier change
export const updateMemberTierSchema = z.object({
  tierId: z.string().uuid().nullable(),
})

// Join request
export const joinGroupSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    answer: z.string().trim().min(1).max(1000),
  })).optional().default([]),
})

// Join request query filters
export const joinRequestQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'DECLINED']).optional().default('PENDING'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

// Create invite
export const createInviteSchema = z.object({
  maxUses: z.number().int().positive().nullable().optional(),
  expiresInDays: z.number().int().positive().max(365).nullable().optional(),
})

// Invite by email
export const inviteByEmailSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(50),
})

// Members query
export const membersQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  role: z.enum(['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER']).optional(),
  search: z.string().trim().max(100).optional(),
})

// Discovery query
export const discoverQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  tag: z.string().trim().max(50).optional(),
  pricing: z.enum(['FREE', 'PAID']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(9),
})
