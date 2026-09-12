/**
 * @file progress.controller.js
 * @description Controllers for course progress management.
 */

import { progressService } from './progress.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Updates progress for a lesson.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function updateLessonProgress(req, res, next) {
  try {
    const progress = await progressService.updateLessonProgress(req.params.lessonId, req.user.id, req.body)
    return sendSuccess(res, progress, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Gets progress for an entire course.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function getCourseProgress(req, res, next) {
  try {
    const progress = await progressService.getCourseProgress(req.params.courseId, req.user.id)
    return sendSuccess(res, progress, 200)
  } catch (error) {
    next(error)
  }
}
