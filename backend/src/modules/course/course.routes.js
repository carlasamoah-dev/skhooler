/**
 * @file course.routes.js
 * @description Routes for course management.
 */

import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { loadGroup, requireMembership, requireAdmin } from '../../middleware/authorize.js'
import { validateBody } from '../../middleware/validateRequest.js'
import * as courseController from './course.controller.js'
import * as progressController from './progress.controller.js'
import { 
  createCourseSchema, 
  updateCourseSchema, 
  reorderSchema,
  createModuleSchema,
  updateModuleSchema,
  createLessonSchema,
  updateLessonSchema,
  updateProgressSchema,
  grantAccessSchema
} from './course.schema.js'

const router = Router({ mergeParams: true })

// Courses
router.post('/', authenticate, loadGroup, requireAdmin, validateBody(createCourseSchema), courseController.createCourse)
router.get('/', authenticate, loadGroup, requireMembership(), courseController.getCourses)
router.get('/:courseSlug', authenticate, loadGroup, requireMembership(), courseController.getCourse)
router.patch('/:courseId', authenticate, loadGroup, requireAdmin, validateBody(updateCourseSchema), courseController.updateCourse)
router.delete('/:courseId', authenticate, loadGroup, requireAdmin, courseController.deleteCourse)
router.patch('/reorder', authenticate, loadGroup, requireAdmin, validateBody(reorderSchema), courseController.reorderCourses)

// Modules
router.post('/:courseId/modules', authenticate, loadGroup, requireAdmin, validateBody(createModuleSchema), courseController.createModule)
router.patch('/modules/:moduleId', authenticate, loadGroup, requireAdmin, validateBody(updateModuleSchema), courseController.updateModule)
router.delete('/modules/:moduleId', authenticate, loadGroup, requireAdmin, courseController.deleteModule)
router.patch('/:courseId/modules/reorder', authenticate, loadGroup, requireAdmin, validateBody(reorderSchema), courseController.reorderModules)

// Lessons
router.post('/modules/:moduleId/lessons', authenticate, loadGroup, requireAdmin, validateBody(createLessonSchema), courseController.createLesson)
router.get('/lessons/:lessonId', authenticate, loadGroup, requireMembership(), courseController.getLesson)
router.patch('/lessons/:lessonId', authenticate, loadGroup, requireAdmin, validateBody(updateLessonSchema), courseController.updateLesson)
router.delete('/lessons/:lessonId', authenticate, loadGroup, requireAdmin, courseController.deleteLesson)
router.patch('/modules/:moduleId/lessons/reorder', authenticate, loadGroup, requireAdmin, validateBody(reorderSchema), courseController.reorderLessons)

// Progress
router.post('/lessons/:lessonId/progress', authenticate, loadGroup, requireMembership(), validateBody(updateProgressSchema), progressController.updateLessonProgress)
router.get('/:courseId/progress', authenticate, loadGroup, requireMembership(), progressController.getCourseProgress)

// Access
router.post('/:courseId/access', authenticate, loadGroup, requireAdmin, validateBody(grantAccessSchema), courseController.grantMemberAccess)
router.delete('/:courseId/access/:userId', authenticate, loadGroup, requireAdmin, courseController.revokeMemberAccess)
router.get('/:courseId/access', authenticate, loadGroup, requireAdmin, courseController.getCourseMembersAccess)

export default router
