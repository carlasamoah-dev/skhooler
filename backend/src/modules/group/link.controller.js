/**
 * Link controller
 */
import { linkService } from './link.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Create link
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function createLink(req, res, next) {
  try {
    const link = await linkService.createLink(req.group.id, req.body)
    sendSuccess(res, link, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get links
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getLinks(req, res, next) {
  try {
    const links = await linkService.getLinks(req.group.id)
    sendSuccess(res, links, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Update link
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function updateLink(req, res, next) {
  try {
    const link = await linkService.updateLink(req.group.id, req.params.linkId, req.body)
    sendSuccess(res, link, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete link
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function deleteLink(req, res, next) {
  try {
    await linkService.deleteLink(req.group.id, req.params.linkId)
    sendSuccess(res, { message: 'Link deleted successfully' }, 200)
  } catch (error) {
    next(error)
  }
}
