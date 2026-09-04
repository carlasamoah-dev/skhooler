/**
 * @fileoverview Event Controller
 * Handles HTTP requests for event operations.
 */

import * as eventService from './event.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

/**
 * Creates a new event.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function createEvent(req, res, next) {
  try {
    const groupId = req.group.id;
    const userId = req.user.id;
    const eventData = req.body;
    
    const event = await eventService.createEvent(groupId, userId, eventData);
    return sendSuccess(res, event, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a list of events.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getEvents(req, res, next) {
  try {
    const groupId = req.group.id;
    const userId = req.user.id;
    const role = req.membership?.role;
    const query = req.query;

    const result = await eventService.getEvents(groupId, userId, role, query);
    return sendSuccess(res, result.data, 200, result.meta);
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a specific event by ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getEvent(req, res, next) {
  try {
    const groupId = req.group.id;
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const role = req.membership?.role;

    const event = await eventService.getEventById(groupId, eventId, userId, role);
    return sendSuccess(res, event, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Updates an event.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function updateEvent(req, res, next) {
  try {
    const groupId = req.group.id;
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const role = req.membership?.role;
    const updateData = req.body;

    const event = await eventService.updateEvent(groupId, eventId, userId, role, updateData);
    return sendSuccess(res, event, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Cancels an event.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function cancelEvent(req, res, next) {
  try {
    const groupId = req.group.id;
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const role = req.membership?.role;

    const event = await eventService.cancelEvent(groupId, eventId, userId, role);
    return sendSuccess(res, event, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes an event.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function deleteEvent(req, res, next) {
  try {
    const groupId = req.group.id;
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const role = req.membership?.role;

    await eventService.deleteEvent(groupId, eventId, userId, role);
    return sendSuccess(res, { message: 'Event deleted successfully' }, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * RSVPs to an event.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function rsvpEvent(req, res, next) {
  try {
    const groupId = req.group.id;
    const eventId = req.params.eventId;
    const userId = req.user.id;
    const rsvpData = req.body;

    const rsvp = await eventService.rsvpEvent(groupId, eventId, userId, rsvpData);
    return sendSuccess(res, rsvp, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves attendees for an event.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getAttendees(req, res, next) {
  try {
    const groupId = req.group.id;
    const eventId = req.params.eventId;
    const query = req.query;

    const result = await eventService.getEventAttendees(groupId, eventId, query);
    return sendSuccess(res, result.data, 200, result.meta);
  } catch (error) {
    next(error);
  }
}

/**
 * Downloads the ICS file for an event.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function downloadIcs(req, res, next) {
  try {
    const groupId = req.group.id;
    const eventId = req.params.eventId;

    const { icsString, filename } = await eventService.getEventIcs(groupId, eventId);
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'event.ics'}"`);
    return res.send(icsString);
  } catch (error) {
    next(error);
  }
}
