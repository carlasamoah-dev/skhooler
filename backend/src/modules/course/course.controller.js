/**
 * @file course.controller.js
 * @description Controllers for course management.
 */

import { courseService } from './course.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Creates a new course.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function createCourse(req, res, next) {
  try {
    const course = await courseService.createCourse(req.group.id, req.body)
    return sendSuccess(res, course, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Gets a list of courses.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function getCourses(req, res, next) {
  try {
    const courses = await courseService.getCourses(req.group.id, req.user.id, req.membership?.role)
    return sendSuccess(res, courses, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Gets a specific course by slug.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function getCourse(req, res, next) {
  try {
    const course = await courseService.getCourseBySlug(req.group.id, req.params.courseSlug, req.user.id, req.membership?.role)
    return sendSuccess(res, course, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Updates a course.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function updateCourse(req, res, next) {
  try {
    const course = await courseService.updateCourse(req.group.id, req.params.courseId, req.body)
    return sendSuccess(res, course, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Deletes a course.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function deleteCourse(req, res, next) {
  try {
    const result = await courseService.deleteCourse(req.group.id, req.params.courseId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Reorders courses.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function reorderCourses(req, res, next) {
  try {
    const result = await courseService.reorderCourses(req.group.id, req.body.orderedIds)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Creates a module.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function createModule(req, res, next) {
  try {
    const module = await courseService.createModule(req.params.courseId, req.body)
    return sendSuccess(res, module, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Updates a module.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function updateModule(req, res, next) {
  try {
    const module = await courseService.updateModule(req.params.moduleId, req.body)
    return sendSuccess(res, module, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Deletes a module.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function deleteModule(req, res, next) {
  try {
    const result = await courseService.deleteModule(req.params.moduleId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Reorders modules.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function reorderModules(req, res, next) {
  try {
    const result = await courseService.reorderModules(req.params.courseId, req.body.orderedIds)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Creates a lesson.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function createLesson(req, res, next) {
  try {
    const lesson = await courseService.createLesson(req.params.moduleId, req.body)
    return sendSuccess(res, lesson, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Gets a lesson.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function getLesson(req, res, next) {
  try {
    const lesson = await courseService.getLesson(req.group.id, req.params.lessonId, req.user.id, req.membership?.role)
    return sendSuccess(res, lesson, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Updates a lesson.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function updateLesson(req, res, next) {
  try {
    const lesson = await courseService.updateLesson(req.params.lessonId, req.body)
    return sendSuccess(res, lesson, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Deletes a lesson.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function deleteLesson(req, res, next) {
  try {
    const result = await courseService.deleteLesson(req.params.lessonId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Reorders lessons.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function reorderLessons(req, res, next) {
  try {
    const result = await courseService.reorderLessons(req.params.moduleId, req.body.orderedIds)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Grants access to a course member.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function grantMemberAccess(req, res, next) {
  try {
    const access = await courseService.grantMemberAccess(req.params.courseId, req.body.userId, req.user.id)
    return sendSuccess(res, access, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Revokes access from a course member.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function revokeMemberAccess(req, res, next) {
  try {
    const result = await courseService.revokeMemberAccess(req.params.courseId, req.params.userId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Gets members with access to a course.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function getCourseMembersAccess(req, res, next) {
  try {
    const members = await courseService.getCourseMembersAccess(req.params.courseId, req.query)
    return sendSuccess(res, members, 200)
  } catch (error) {
    next(error)
  }
}
