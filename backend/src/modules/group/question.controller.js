/**
 * Question controller
 */
import { questionService } from './question.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Set questions
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function setQuestions(req, res, next) {
  try {
    const questions = await questionService.setQuestions(req.group.id, req.body)
    sendSuccess(res, questions, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Get questions
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getQuestions(req, res, next) {
  try {
    const questions = await questionService.getQuestions(req.group.id)
    sendSuccess(res, questions, 200)
  } catch (error) {
    next(error)
  }
}
