/**
 * @fileoverview Notification service for handling user notifications and preferences.
 */
import { prisma } from '../../config/database.js';
import { emitToUser } from '../../utils/realtime.js';
import { encodeCursor, buildPaginationMeta } from '../../utils/pagination.js';

class NotificationService {
  /**
   * Create a new notification and emit real-time updates.
   * @param {Object} params - Notification parameters.
   * @param {string} params.userId - Target user's ID.
   * @param {string} [params.groupId=null] - Optional group ID associated with the notification.
   * @param {string} [params.actorId=null] - Optional ID of the user who triggered the notification.
   * @param {string} params.type - The type of notification.
   * @param {string} params.title - Notification title.
   * @param {string} params.message - Notification message/body.
   * @param {string} [params.link=null] - Optional link for the notification.
   * @param {Object} [params.data=null] - Optional custom data associated with the notification.
   * @returns {Promise<Object|null>} The created notification or null if actor is user.
   */
  async createNotification({ userId, groupId = null, actorId = null, type, title, message, link = null, data = null }) {
    if (actorId && actorId === userId) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        groupId,
        actorId,
        type,
        title,
        message,
        link,
        data,
      },
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
          }
        }
      }
    });

    const unreadResult = await this.getUnreadCount(userId);
    const unreadCount = unreadResult.count;

    emitToUser(userId, 'notification:new', notification);
    emitToUser(userId, 'notification:unread_count', { count: unreadCount });

    return notification;
  }

  /**
   * Get paginated notifications for a user.
   * @param {string} userId - The user's ID.
   * @param {Object} options - Pagination options.
   * @param {string} [options.cursor] - Cursor for pagination.
   * @param {number} [options.limit=30] - Limit of items to fetch.
   * @param {boolean} [options.unreadOnly=false] - If true, fetches only unread notifications.
   * @returns {Promise<Object>} An object containing data array and pagination meta.
   */
  async getNotifications(userId, { cursor, limit = 30, unreadOnly = false }) {
    const take = limit + 1;
    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const query = {
      where,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        group: {
          select: { id: true, name: true, slug: true, iconUrl: true }
        }
      }
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1; // Skip the cursor itself
    }

    const records = await prisma.notification.findMany(query);
    const meta = buildPaginationMeta(records, limit);
    
    // Remove the extra record used for nextCursor logic if it exists
    if (records.length > limit) {
      records.pop();
    }

    return { data: records, meta };
  }

  /**
   * Get the count of unread notifications for a user.
   * @param {string} userId - The user's ID.
   * @returns {Promise<{ count: number }>} An object containing the unread count.
   */
  async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    return { count };
  }

  /**
   * Mark specific notifications as read.
   * @param {string} userId - The user's ID.
   * @param {string[]} notificationIds - Array of notification IDs to mark as read.
   * @returns {Promise<{ success: boolean }>} Object indicating success.
   */
  async markAsRead(userId, notificationIds) {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    const unreadResult = await this.getUnreadCount(userId);
    emitToUser(userId, 'notification:unread_count', { count: unreadResult.count });

    return { success: true };
  }

  /**
   * Mark all unread notifications as read for a user.
   * @param {string} userId - The user's ID.
   * @returns {Promise<{ success: boolean }>} Object indicating success.
   */
  async markAllAsRead(userId) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    emitToUser(userId, 'notification:unread_count', { count: 0 });

    return { success: true };
  }

  /**
   * Delete a specific notification.
   * @param {string} userId - The user's ID.
   * @param {string} notificationId - The ID of the notification to delete.
   * @returns {Promise<void>}
   */
  async deleteNotification(userId, notificationId) {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    });
  }

  /**
   * Get notification preferences for a user, creating defaults if they don't exist.
   * @param {string} userId - The user's ID.
   * @returns {Promise<Object>} The user's notification preferences.
   */
  async getPreferences(userId) {
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });
    return preferences;
  }

  /**
   * Update notification preferences for a user.
   * @param {string} userId - The user's ID.
   * @param {Object} data - The preferences to update.
   * @returns {Promise<Object>} The updated notification preferences.
   */
  async updatePreferences(userId, data) {
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data
      }
    });
    return preferences;
  }
}

export const notificationService = new NotificationService();
