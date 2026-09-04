/**
 * @file search.controller.js
 * Controllers for the search API.
 */

import { searchService } from './search.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

/**
 * Perform a unified search within a specific group.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 */
export async function searchGroup(req, res, next) {
  try {
    const groupId = req.group.id;
    const userId = req.user?.id;
    const { q, type, limit } = req.query;
    
    const data = await searchService.searchInGroup(groupId, userId, { q, type, limit });
    
    return sendSuccess(res, data, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Perform a global search for public groups.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 */
export async function globalSearch(req, res, next) {
  try {
    const { q, limit } = req.query;
    
    const data = await searchService.globalSearch({ q, limit });
    
    return sendSuccess(res, data, 200);
  } catch (error) {
    next(error);
  }
}
