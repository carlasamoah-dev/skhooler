/**
 * @fileoverview Post routes
 */

import { Router } from 'express'
import * as postController from './post.controller.js'
import * as commentController from './comment.controller.js'
import * as pollController from './poll.controller.js'
import { authenticate } from '../../middleware/auth.js'
import { loadGroup, requireMembership, requireAdmin, requireModerator } from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validateRequest.js'
import * as schemas from './post.schema.js'

const router = Router({ mergeParams: true })

// ──── Posts ────
router.post(
  '/', 
  authenticate, 
  loadGroup, 
  requireModerator, 
  validateBody(schemas.createPostSchema), 
  postController.createPost
)

router.get(
  '/', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  validateQuery(schemas.postsQuerySchema), 
  postController.getFeed
)

router.get(
  '/:postId', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  postController.getPost
)

router.patch(
  '/:postId', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  validateBody(schemas.updatePostSchema), 
  postController.updatePost
)

router.delete(
  '/:postId', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  postController.deletePost
)

router.post(
  '/:postId/pin', 
  authenticate, 
  loadGroup, 
  requireModerator, 
  postController.togglePin
)

router.post(
  '/:postId/comments/toggle', 
  authenticate, 
  loadGroup, 
  requireModerator, 
  postController.toggleComments
)

router.post(
  '/:postId/like', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  postController.toggleLike
)

// ──── Polls ────
router.post(
  '/:postId/poll/vote', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  validateBody(schemas.pollVoteSchema), 
  pollController.vote
)

router.get(
  '/:postId/poll', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  pollController.getResults
)

// ──── Comments ────
router.post(
  '/:postId/comments', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  validateBody(schemas.createCommentSchema),
  commentController.createComment
)

router.get(
  '/:postId/comments', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  validateQuery(schemas.commentsQuerySchema),
  commentController.getComments
)

router.patch(
  '/:postId/comments/:commentId', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  validateBody(schemas.updateCommentSchema),
  commentController.updateComment
)

router.delete(
  '/:postId/comments/:commentId', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  commentController.deleteComment
)

router.post(
  '/:postId/comments/:commentId/like', 
  authenticate, 
  loadGroup, 
  requireMembership(), 
  commentController.toggleLike
)

export default router
