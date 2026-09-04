/**
 * @fileoverview Comment controller
 */

import { commentService } from './comment.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Create a new comment
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function createComment(req, res, next) {
  try {
    const comment = await commentService.createComment(
      req.group.id,
      req.params.postId,
      req.user.id,
      req.body
    )
    return sendSuccess(res, comment, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get comments for a post
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getComments(req, res, next) {
  try {
    const comments = await commentService.getComments(
      req.group.id,
      req.params.postId,
      req.user?.id,
      req.query
    )
    return sendSuccess(res, comments)
  } catch (error) {
    next(error)
  }
}

/**
 * Update a comment
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function updateComment(req, res, next) {
  try {
    const comment = await commentService.updateComment(
      req.group.id,
      req.params.postId,
      req.params.commentId,
      req.user.id,
      req.membership?.role,
      req.body
    )
    return sendSuccess(res, comment)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a comment
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function deleteComment(req, res, next) {
  try {
    await commentService.deleteComment(
      req.group.id,
      req.params.postId,
      req.params.commentId,
      req.user.id,
      req.membership?.role
    )
    return sendSuccess(res, { message: 'Comment deleted successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Toggle like on a comment
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function toggleLike(req, res, next) {
  try {
    const result = await commentService.toggleCommentLike(
      req.group.id,
      req.params.commentId,
      req.user.id
    )
    return sendSuccess(res, result)
  } catch (error) {
    next(error)
  }
}
