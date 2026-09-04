/**
 * @fileoverview Post controller
 */

import { postService } from './post.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Create a new post
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function createPost(req, res, next) {
  try {
    const post = await postService.createPost(req.group.id, req.user.id, req.body)
    return sendSuccess(res, post, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get group feed
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getFeed(req, res, next) {
  try {
    const posts = await postService.getFeed(req.group.id, req.user?.id, req.query)
    return sendSuccess(res, posts)
  } catch (error) {
    next(error)
  }
}

/**
 * Get a specific post by ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getPost(req, res, next) {
  try {
    const post = await postService.getPostById(req.group.id, req.params.postId, req.user?.id)
    return sendSuccess(res, post)
  } catch (error) {
    next(error)
  }
}

/**
 * Update a post
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function updatePost(req, res, next) {
  try {
    const post = await postService.updatePost(
      req.group.id, 
      req.params.postId, 
      req.user.id, 
      req.membership?.role, 
      req.body
    )
    return sendSuccess(res, post)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a post
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function deletePost(req, res, next) {
  try {
    await postService.deletePost(
      req.group.id, 
      req.params.postId, 
      req.user.id, 
      req.membership?.role
    )
    return sendSuccess(res, { message: 'Post deleted successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Toggle pin status of a post
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function togglePin(req, res, next) {
  try {
    const post = await postService.togglePin(req.group.id, req.params.postId, req.user.id)
    return sendSuccess(res, post)
  } catch (error) {
    next(error)
  }
}

/**
 * Toggle like on a post
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function toggleLike(req, res, next) {
  try {
    const result = await postService.toggleLike(req.group.id, req.params.postId, req.user.id)
    return sendSuccess(res, result)
  } catch (error) {
    next(error)
  }
}
