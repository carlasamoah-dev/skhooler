/**
 * @fileoverview Analytics controllers for group and platform-wide analytics.
 */

import * as analyticsService from './analytics.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

/**
 * Get group overview analytics.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getGroupOverview(req, res, next) {
  try {
    const data = await analyticsService.getGroupOverview(req.group.id, req.query);
    return sendSuccess(res, data, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Get member growth analytics.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getMemberGrowth(req, res, next) {
  try {
    const data = await analyticsService.getMemberGrowthChart(req.group.id, req.query);
    return sendSuccess(res, data, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Get engagement trends analytics.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getEngagementTrends(req, res, next) {
  try {
    const data = await analyticsService.getEngagementTrends(req.group.id, req.query);
    return sendSuccess(res, data, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Get course analytics.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getCourseAnalytics(req, res, next) {
  try {
    const data = await analyticsService.getCourseAnalytics(req.group.id);
    return sendSuccess(res, data, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Get revenue analytics.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getRevenueAnalytics(req, res, next) {
  try {
    const data = await analyticsService.getRevenueAnalytics(req.group.id, req.query);
    return sendSuccess(res, data, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Get platform overview analytics.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getPlatformOverview(req, res, next) {
  try {
    const data = await analyticsService.getPlatformOverview(req.user.id);
    return sendSuccess(res, data, 200);
  } catch (error) {
    next(error);
  }
}
