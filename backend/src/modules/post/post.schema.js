/**
 * @fileoverview Post validation schemas
 */

import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(2).max(255),
  content: z.string().min(1).max(50000),
  categoryId: z.string().uuid().optional().nullable(),
  isPinned: z.boolean().optional().default(false),
  commentsEnabled: z.boolean().optional().default(true),
  isEmailBroadcast: z.boolean().optional().default(false),
  actionButtonText: z.string().max(100).optional().nullable(),
  actionButtonUrl: z.string().url().max(2000).optional().nullable(),
  linkPreview: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().url().optional(),
    url: z.string().url().optional()
  }).optional().nullable(),
  videoAssetId: z.string().max(100).optional().nullable(),
  videoPlaybackId: z.string().max(100).optional().nullable(),
  videoUrl: z.string().url().max(2000).optional().nullable(),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      size: z.number(),
      type: z.string()
    })
  ).optional().nullable(),
  poll: z.object({
    question: z.string().min(1).max(500),
    options: z.array(z.string()).min(2).max(10),
    allowMultiple: z.boolean().optional().default(false),
    expiresInDays: z.number().min(1).max(30).optional().nullable()
  }).optional().nullable()
});

export const updatePostSchema = createPostSchema.partial();

export const postsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  sort: z.enum(['new', 'likes', 'comments']).optional().default('new')
});

export const pollVoteSchema = z.object({
  optionIds: z.array(z.string().uuid()).min(1)
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  parentCommentId: z.string().uuid().optional().nullable(),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      size: z.number(),
      type: z.string()
    })
  ).optional().nullable()
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1).max(10000)
});

export const commentsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50)
});

