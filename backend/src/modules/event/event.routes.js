/**
 * @fileoverview Event Routes
 * Express routes for event operations.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { loadGroup, requireAdmin, requireMembership } from '../../middleware/authorize.js';
import { validateBody, validateQuery } from '../../middleware/validateRequest.js';
import {
  createEventSchema,
  updateEventSchema,
  eventsQuerySchema,
  eventRsvpSchema
} from './event.schema.js';
import * as eventController from './event.controller.js';

const router = Router({ mergeParams: true });

// POST /
router.post(
  '/',
  authenticate,
  loadGroup,
  requireAdmin,
  validateBody(createEventSchema),
  eventController.createEvent
);

// GET /
router.get(
  '/',
  authenticate,
  loadGroup,
  requireMembership(),
  validateQuery(eventsQuerySchema),
  eventController.getEvents
);

// GET /:eventId
router.get(
  '/:eventId',
  authenticate,
  loadGroup,
  requireMembership(),
  eventController.getEvent
);

// PATCH /:eventId
router.patch(
  '/:eventId',
  authenticate,
  loadGroup,
  requireAdmin,
  validateBody(updateEventSchema),
  eventController.updateEvent
);

// POST /:eventId/cancel
router.post(
  '/:eventId/cancel',
  authenticate,
  loadGroup,
  requireAdmin,
  eventController.cancelEvent
);

// DELETE /:eventId
router.delete(
  '/:eventId',
  authenticate,
  loadGroup,
  requireAdmin,
  eventController.deleteEvent
);

// POST /:eventId/rsvp
router.post(
  '/:eventId/rsvp',
  authenticate,
  loadGroup,
  requireMembership(),
  validateBody(eventRsvpSchema),
  eventController.rsvpEvent
);

// GET /:eventId/attendees
router.get(
  '/:eventId/attendees',
  authenticate,
  loadGroup,
  requireMembership(),
  eventController.getAttendees
);

// GET /:eventId/ics
router.get(
  '/:eventId/ics',
  authenticate,
  loadGroup,
  requireMembership(),
  eventController.downloadIcs
);

export default router;
