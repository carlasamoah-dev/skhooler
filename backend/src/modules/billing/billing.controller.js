/**
 * Billing Controller
 * Handles Phase 8 Monetization & Stripe Payments with Test/Dummy Mode
 */

import { sendSuccess } from '../../utils/apiResponse.js'
import * as billingService from './billing.service.js'

/**
 * Handles dummy membership checkout
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function dummyMembershipCheckout(req, res, next) {
  try {
    const result = await billingService.simulateDummyMembershipCheckout(req.user.id, req.body)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Handles dummy platform checkout
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function dummyPlatformCheckout(req, res, next) {
  try {
    const result = await billingService.simulateDummyPlatformCheckout(req.user.id, req.body)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Retrieves the user's subscriptions
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getSubscriptions(req, res, next) {
  try {
    const subscriptions = await billingService.getUserSubscriptions(req.user.id)
    return sendSuccess(res, subscriptions, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Retrieves the user's payment history
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getPaymentHistory(req, res, next) {
  try {
    const history = await billingService.getUserPaymentHistory(req.user.id, req.query)
    return sendSuccess(res, history, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Cancels a user's subscription
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function cancelSubscription(req, res, next) {
  try {
    const result = await billingService.cancelSubscription(req.user.id, req.params.subscriptionId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Retrieves the user's referral stats
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getReferralStats(req, res, next) {
  try {
    const stats = await billingService.getReferralStats(req.user.id)
    return sendSuccess(res, stats, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Validates a referral code
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function validateReferralCode(req, res, next) {
  try {
    const result = await billingService.trackReferralCookie(req.params.code)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}
