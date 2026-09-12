/**
 * Notification Controller
 * Handles notification retrieval, updates, and preferences.
 */

import { sendSuccess } from '../../utils/apiResponse.js'
import * as notificationService from './notification.service.js'

/**
 * Get paginated notifications for the authenticated user
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id
    const query = req.query
    const result = await notificationService.getNotifications(userId, query)
    return sendSuccess(res, { data: result.data, meta: result.meta })
  } catch (error) {
    next(error)
  }
}

/**
 * Get the unread notification count for the authenticated user
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user.id
    const result = await notificationService.getUnreadCount(userId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Mark specific notifications as read
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id
    const { notificationIds } = req.body
    const result = await notificationService.markAsRead(userId, notificationIds)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Mark all notifications as read for the authenticated user
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id
    const result = await notificationService.markAllAsRead(userId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a specific notification
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function deleteNotification(req, res, next) {
  try {
    const userId = req.user.id
    const { notificationId } = req.params
    const result = await notificationService.deleteNotification(userId, notificationId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Get notification preferences for the authenticated user
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getPreferences(req, res, next) {
  try {
    const userId = req.user.id
    const result = await notificationService.getPreferences(userId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Update notification preferences for the authenticated user
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function updatePreferences(req, res, next) {
  try {
    const userId = req.user.id
    const updateData = req.body
    const result = await notificationService.updatePreferences(userId, updateData)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}
