/**
 * @file search.service.js
 * Business logic for full-text search across various modules.
 */

import { prisma } from '../../config/database.js';

class SearchService {
  /**
   * Search within a specific group for posts, courses, lessons, events, and members.
   * @param {string} groupId - The ID of the group to search within.
   * @param {string} userId - The ID of the user performing the search.
   * @param {Object} options - Search options.
   * @param {string} options.q - The search query.
   * @param {string} [options.type='all'] - The type of content to search for.
   * @param {number} [options.limit=20] - Maximum results per category.
   * @returns {Promise<Object>} The aggregated search results.
   */
  async searchInGroup(groupId, userId, { q, type = 'all', limit = 20 }) {
    const results = {
      posts: [],
      courses: [],
      lessons: [],
      events: [],
      members: [],
    };
    let total = 0;

    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          groupId,
          deletedAt: null,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });
      results.posts = posts;
      total += posts.length;
    }

    if (type === 'all' || type === 'courses') {
      const courses = await prisma.course.findMany({
        where: {
          groupId,
          deletedAt: null,
          isPublished: true,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });
      results.courses = courses;
      total += courses.length;
    }

    if (type === 'all' || type === 'lessons') {
      const lessons = await prisma.lesson.findMany({
        where: {
          module: {
            course: {
              groupId,
              deletedAt: null,
            },
          },
          isPublished: true,
          deletedAt: null,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });
      results.lessons = lessons;
      total += lessons.length;
    }

    if (type === 'all' || type === 'events') {
      const events = await prisma.event.findMany({
        where: {
          groupId,
          deletedAt: null,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });
      results.events = events;
      total += events.length;
    }

    if (type === 'all' || type === 'members') {
      const members = await prisma.user.findMany({
        where: {
          groupMembers: {
            some: {
              groupId,
              status: 'ACTIVE', // Assuming status check is required or typical
            }
          },
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });
      results.members = members;
      total += members.length;
    }

    return {
      query: q,
      results,
      total,
    };
  }

  /**
   * Search globally for public groups.
   * @param {Object} options - Search options.
   * @param {string} options.q - The search query.
   * @param {number} [options.limit=10] - Maximum results.
   * @returns {Promise<Object>} The aggregated search results.
   */
  async globalSearch({ q, limit = 10 }) {
    const groups = await prisma.group.findMany({
      where: {
        visibility: 'PUBLIC',
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        coverUrl: true,
        pricingModel: true,
        price: true,
        memberCount: true,
        tags: true,
      },
    });
    return {
      query: q,
      results: { groups },
      total: groups.length,
    };
  }
}

export const searchService = new SearchService();
