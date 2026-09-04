/**
 * @fileoverview Poll controller
 */

import { pollService } from './poll.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Vote on a poll
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function vote(req, res, next) {
  try {
    const result = await pollService.vote(
      req.group.id,
      req.params.postId,
      req.user.id,
      req.body
    )
    return sendSuccess(res, result)
  } catch (error) {
    next(error)
  }
}

/**
 * Get poll results
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getResults(req, res, next) {
  try {
    const results = await pollService.getPollResults(
      req.params.postId,
      req.user?.id
    )
    return sendSuccess(res, results)
  } catch (error) {
    next(error)
  }
}
