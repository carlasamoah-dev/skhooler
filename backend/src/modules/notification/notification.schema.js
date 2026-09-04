import { z } from 'zod';

export const notificationsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
  unreadOnly: z.enum(['true', 'false']).transform(v => v === 'true').optional().default(false),
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1),
});

export const updatePreferencesSchema = z.object({
  emailNewPost: z.boolean().optional(),
  emailCommentReply: z.boolean().optional(),
  emailEventReminder: z.boolean().optional(),
  inAppAll: z.boolean().optional(),
});
