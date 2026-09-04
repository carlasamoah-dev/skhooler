/**
 * @file search.routes.js
 * Routes for the unified search endpoints.
 */

import { Router } from 'express';
import { searchGroup, globalSearch } from './search.controller.js';
import { validateQuery } from '../../middleware/validateRequest.js';
import { authenticate } from '../../middleware/auth.js';
import { loadGroup, requireMembership } from '../../middleware/authorize.js';
import { searchQuerySchema } from './search.schema.js';

const router = Router({ mergeParams: true });

// Global search
router.get('/global', validateQuery(searchQuerySchema), globalSearch);

// Group search
router.get('/', authenticate, loadGroup, requireMembership(), validateQuery(searchQuerySchema), searchGroup);

export default router;
