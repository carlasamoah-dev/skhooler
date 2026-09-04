/**
 * Billing Routes
 */

import { Router } from 'express'
import * as billingController from './billing.controller.js'
import { authenticate } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validateRequest.js'
import {
  dummyMembershipCheckoutSchema,
  dummyPlatformCheckoutSchema
} from './billing.validation.js'

const router = Router()

// Dummy checkouts
router.post(
  '/dummy/membership-checkout',
  authenticate,
  validateBody(dummyMembershipCheckoutSchema),
  billingController.dummyMembershipCheckout
)

router.post(
  '/dummy/platform-checkout',
  authenticate,
  validateBody(dummyPlatformCheckoutSchema),
  billingController.dummyPlatformCheckout
)

// Subscriptions
router.get(
  '/subscriptions',
  authenticate,
  billingController.getSubscriptions
)

// Payment History
router.get(
  '/history',
  authenticate,
  billingController.getPaymentHistory
)

// Cancel Subscription
router.post(
  '/subscriptions/:subscriptionId/cancel',
  authenticate,
  billingController.cancelSubscription
)

// Referrals
router.get(
  '/referrals',
  authenticate,
  billingController.getReferralStats
)

// Validate Referral Code (Public)
router.get(
  '/referrals/validate/:code',
  billingController.validateReferralCode
)

export default router
