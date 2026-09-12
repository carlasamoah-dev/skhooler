/**
 * Event service for managing calendar and scheduled events.
 */
import { prisma } from '../../config/database.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors.js';
import { decodeCursor, encodeCursor, buildPaginationMeta } from '../../utils/pagination.js';
import { generateIcs } from '../../utils/calendar.js';

class EventService {
  /**
   * Create a new event.
   * @param {string} groupId 
   * @param {string} createdBy 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createEvent(groupId, createdBy, data) {
    if (data.accessType === 'TIER_LOCKED' && data.requiredTierId) {
      const tier = await prisma.memberTier.findFirst({
        where: { id: data.requiredTierId, groupId },
      });
      if (!tier) {
        throw new BadRequestError('Required tier does not exist or does not belong to this group');
      }
    }

    const event = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          ...data,
          groupId,
          createdBy,
          attendeeCount: 1,
        },
        include: {
          creator: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      });

      await tx.eventRsvp.create({
        data: {
          eventId: newEvent.id,
          userId: createdBy,
          status: 'GOING',
        },
      });

      return newEvent;
    });

    return event;
  }

  /**
   * Get events for a group.
   * @param {string} groupId 
   * @param {string} userId 
   * @param {string} userRole 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getEvents(groupId, userId, userRole, { startAfter, startBefore, filter = 'upcoming', cursor, limit = 50 }) {
    const where = {
      groupId,
      deletedAt: null,
    };

    if (filter === 'upcoming') {
      where.startDate = { gte: new Date() };
    } else if (filter === 'past') {
      where.startDate = { lt: new Date() };
    }

    if (startAfter || startBefore) {
      where.startDate = {};
      if (startAfter) where.startDate.gte = new Date(startAfter);
      if (startBefore) where.startDate.lte = new Date(startBefore);
    }

    const orderBy = filter === 'past' ? { startDate: 'desc' } : { startDate: 'asc' };

    const query = {
      where,
      take: limit + 1,
      orderBy,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        requiredTier: true,
        rsvps: {
          where: { userId },
        },
      },
    };

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        query.cursor = { id: decoded };
        query.skip = 1;
      }
    }

    const events = await prisma.event.findMany(query);

    let hasMore = false;
    if (events.length > limit) {
      hasMore = true;
      events.pop();
    }

    const mappedEvents = await Promise.all(events.map(async (event) => {
      const myRsvp = event.rsvps[0]?.status || null;
      let hasAccess = true;

      if (event.accessType === 'TIER_LOCKED' && userRole !== 'OWNER' && userRole !== 'ADMIN') {
        if (!event.requiredTierId) {
          hasAccess = false;
        } else {
          const member = await prisma.groupMember.findFirst({
            where: { groupId, userId, tierId: event.requiredTierId, status: 'ACTIVE' },
          });
          hasAccess = !!member;
        }
      }

      const { rsvps, ...rest } = event;
      return { ...rest, myRsvp, hasAccess };
    }));

    return {
      data: mappedEvents,
      meta: buildPaginationMeta(mappedEvents, limit, hasMore),
    };
  }

  /**
   * Get an event by ID.
   * @param {string} groupId 
   * @param {string} eventId 
   * @param {string} userId 
   * @param {string} userRole 
   * @returns {Promise<Object>}
   */
  async getEventById(groupId, eventId, userId, userRole) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, groupId, deletedAt: null },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        requiredTier: true,
        rsvps: {
          where: { userId },
        },
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const myRsvp = event.rsvps[0]?.status || null;
    let hasAccess = true;

    if (event.accessType === 'TIER_LOCKED' && userRole !== 'OWNER' && userRole !== 'ADMIN') {
      if (!event.requiredTierId) {
        hasAccess = false;
      } else {
        const member = await prisma.groupMember.findFirst({
          where: { groupId, userId, tierId: event.requiredTierId, status: 'ACTIVE' },
        });
        hasAccess = !!member;
      }
    }

    const { rsvps, ...rest } = event;
    return { ...rest, myRsvp, hasAccess };
  }

  /**
   * Update an event.
   * @param {string} groupId 
   * @param {string} eventId 
   * @param {string} userId 
   * @param {string} userRole 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateEvent(groupId, eventId, userId, userRole, data) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, groupId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.createdBy !== userId && userRole !== 'OWNER' && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this event');
    }

    if (data.requiredTierId && data.requiredTierId !== event.requiredTierId) {
      const tier = await prisma.memberTier.findFirst({
        where: { id: data.requiredTierId, groupId },
      });
      if (!tier) {
        throw new BadRequestError('Required tier does not exist or does not belong to this group');
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data,
    });

    return updatedEvent;
  }

  /**
   * Cancel an event.
   * @param {string} groupId 
   * @param {string} eventId 
   * @param {string} userId 
   * @param {string} userRole 
   * @returns {Promise<Object>}
   */
  async cancelEvent(groupId, eventId, userId, userRole) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, groupId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.createdBy !== userId && userRole !== 'OWNER' && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to cancel this event');
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { isCancelled: true },
    });

    return updatedEvent;
  }

  /**
   * Delete an event.
   * @param {string} groupId 
   * @param {string} eventId 
   * @param {string} userId 
   * @param {string} userRole 
   * @returns {Promise<void>}
   */
  async deleteEvent(groupId, eventId, userId, userRole) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, groupId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.createdBy !== userId && userRole !== 'OWNER' && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this event');
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * RSVP to an event.
   * @param {string} groupId 
   * @param {string} eventId 
   * @param {string} userId 
   * @param {Object} param3 
   * @returns {Promise<Object>}
   */
  async rsvpEvent(groupId, eventId, userId, { status }) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, groupId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.isCancelled) {
      throw new BadRequestError('Cannot RSVP to a cancelled event');
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.eventRsvp.upsert({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
        update: { status },
        create: {
          eventId,
          userId,
          status,
        },
      });

      const attendeeCount = await tx.eventRsvp.count({
        where: { eventId, status: 'GOING' },
      });

      await tx.event.update({
        where: { id: eventId },
        data: { attendeeCount },
      });

      return { status, attendeeCount };
    });

    return result;
  }

  /**
   * Get attendees of an event.
   * @param {string} groupId 
   * @param {string} eventId 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getEventAttendees(groupId, eventId, { status = 'GOING', cursor, limit = 50 }) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, groupId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const query = {
      where: { eventId, status },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, bio: true },
        },
      },
    };

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        query.cursor = { id: decoded };
        query.skip = 1;
      }
    }

    const rsvps = await prisma.eventRsvp.findMany(query);

    let hasMore = false;
    if (rsvps.length > limit) {
      hasMore = true;
      rsvps.pop();
    }

    return {
      data: rsvps.map((rsvp) => ({ ...rsvp.user, rsvpStatus: rsvp.status })),
      meta: buildPaginationMeta(rsvps, limit, hasMore),
    };
  }

  /**
   * Get event ICS string.
   * @param {string} groupId 
   * @param {string} eventId 
   * @returns {Promise<Object>}
   */
  async getEventIcs(groupId, eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, groupId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const icsString = generateIcs(event);
    const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;

    return { icsString, fileName };
  }
}

export const eventService = new EventService();
