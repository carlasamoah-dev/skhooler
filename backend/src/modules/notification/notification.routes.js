/**
 * Notification Routes
 * Defines express routes for notifications.
 */

import { Router } from 'express'
import * as notificationController from './notification.controller.js'
import { authenticate } from '../../middleware/auth.js'
import { validateBody, validateQuery } from '../../middleware/validateRequest.js'
import { notificationsQuerySchema, markReadSchema, updatePreferencesSchema } from './notification.schema.js'

const router = Router()

// All notification routes require authentication
router.use(authenticate)

// Get notifications
router.get(
  '/',
  validateQuery(notificationsQuerySchema),
  notificationController.getNotifications
)

// Get unread count
router.get(
  '/unread-count',
  notificationController.getUnreadCount
)

// Mark specific notifications as read
router.post(
  '/mark-read',
  validateBody(markReadSchema),
  notificationController.markAsRead
)

// Mark all notifications as read
router.post(
  '/mark-all-read',
  notificationController.markAllAsRead
)

// Delete notification
router.delete(
  '/:notificationId',
  notificationController.deleteNotification
)

// Get notification preferences
router.get(
  '/preferences',
  notificationController.getPreferences
)

// Update notification preferences
router.patch(
  '/preferences',
  validateBody(updatePreferencesSchema),
  notificationController.updatePreferences
)

export default router
