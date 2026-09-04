/**
 * Tier controller
 */
import { tierService } from './tier.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Create tier
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function createTier(req, res, next) {
  try {
    const tier = await tierService.createTier(req.group.id, req.body)
    sendSuccess(res, tier, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get tiers
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getTiers(req, res, next) {
  try {
    const tiers = await tierService.getTiers(req.group.id)
    sendSuccess(res, tiers, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Update tier
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function updateTier(req, res, next) {
  try {
    const tier = await tierService.updateTier(req.group.id, req.params.tierId, req.body)
    sendSuccess(res, tier, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete tier
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function deleteTier(req, res, next) {
  try {
    await tierService.deleteTier(req.group.id, req.params.tierId)
    sendSuccess(res, { message: 'Tier deleted successfully' }, 200)
  } catch (error) {
    next(error)
  }
}
