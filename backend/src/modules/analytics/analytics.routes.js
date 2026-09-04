/**
 * @fileoverview Routes for analytics modules.
 */

import { Router } from 'express';
import * as analyticsController from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { loadGroup, requireAdmin, requireOwner } from '../../middleware/authorize.js';
import { validateQuery } from '../../middleware/validateRequest.js';
import { analyticsQuerySchema } from './analytics.schema.js';

export const groupAnalyticsRoutes = Router({ mergeParams: true });

groupAnalyticsRoutes.use(authenticate, loadGroup);

groupAnalyticsRoutes.get(
  '/overview',
  requireAdmin,
  validateQuery(analyticsQuerySchema),
  analyticsController.getGroupOverview
);

groupAnalyticsRoutes.get(
  '/growth',
  requireAdmin,
  validateQuery(analyticsQuerySchema),
  analyticsController.getMemberGrowth
);

groupAnalyticsRoutes.get(
  '/engagement',
  requireAdmin,
  validateQuery(analyticsQuerySchema),
  analyticsController.getEngagementTrends
);

groupAnalyticsRoutes.get(
  '/courses',
  requireAdmin,
  analyticsController.getCourseAnalytics
);

groupAnalyticsRoutes.get(
  '/revenue',
  requireOwner,
  validateQuery(analyticsQuerySchema),
  analyticsController.getRevenueAnalytics
);

export const adminAnalyticsRoutes = Router();

adminAnalyticsRoutes.get(
  '/platform',
  authenticate,
  analyticsController.getPlatformOverview
);
