/**
 * @fileoverview Analytics calculation engine for processing metrics, engagement, and revenue.
 */

import { prisma } from '../../config/database.js';
import { ForbiddenError } from '../../utils/errors.js';

class AnalyticsService {
  /**
   * Helper to normalize start and end dates.
   * @param {string|Date} startDate
   * @param {string|Date} endDate
   * @returns {{start: Date, end: Date}}
   */
  _getDateRange(startDate, endDate) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 86400000);
    return { start, end };
  }

  /**
   * Gets an overview of group analytics for a date range.
   * @param {string} groupId - The group ID.
   * @param {Object} options - Options object.
   * @param {string|Date} [options.startDate] - Start date for the range.
   * @param {string|Date} [options.endDate] - End date for the range.
   * @returns {Promise<Object>} The group overview metrics.
   */
  async getGroupOverview(groupId, { startDate, endDate } = {}) {
    const { start, end } = this._getDateRange(startDate, endDate);

    // 2. Total members count in groupId
    const totalMembers = await prisma.groupMember.count({
      where: { groupId }
    });

    // 3. New members joined in date range
    const newMembers = await prisma.groupMember.count({
      where: {
        groupId,
        joinedAt: {
          gte: start,
          lte: end
        }
      }
    });

    // 4. Active members in date range (created post, comment, or liked)
    const posts = await prisma.post.findMany({
      where: { groupId, createdAt: { gte: start, lte: end } },
      select: { authorId: true }
    });
    
    // Assuming comments and likes have a relation to post -> group, or direct groupId
    // Using direct relation or nested
    const comments = await prisma.comment.findMany({
      where: { post: { groupId }, createdAt: { gte: start, lte: end } },
      select: { authorId: true }
    });

    const likes = await prisma.like.findMany({
      where: { post: { groupId }, createdAt: { gte: start, lte: end } },
      select: { userId: true }
    });

    const activeUserIds = new Set([
      ...posts.map(p => p.authorId),
      ...comments.map(c => c.authorId),
      ...likes.map(l => l.userId)
    ]);
    const activeMembers = activeUserIds.size;

    // 5. Total posts, comments, likes in range
    const postsCount = await prisma.post.count({
      where: { groupId, createdAt: { gte: start, lte: end } }
    });
    const commentsCount = await prisma.comment.count({
      where: { post: { groupId }, createdAt: { gte: start, lte: end } }
    });
    const likesCount = await prisma.like.count({
      where: { post: { groupId }, createdAt: { gte: start, lte: end } }
    });

    // 6. Total revenue generated in range
    const transactions = await prisma.paymentTransaction.aggregate({
      where: {
        groupId,
        status: 'SUCCEEDED',
        createdAt: { gte: start, lte: end }
      },
      _sum: {
        amount: true
      }
    });
    const revenue = transactions._sum.amount || 0;

    // 7. Compute current MRR
    const subscriptions = await prisma.subscription.aggregate({
      where: {
        groupId,
        status: 'ACTIVE'
      },
      _sum: {
        amount: true
      }
    });
    const mrr = subscriptions._sum.amount || 0;

    return {
      totalMembers,
      newMembers,
      activeMembers,
      postsCount,
      commentsCount,
      likesCount,
      revenue,
      mrr,
      dateRange: { start, end }
    };
  }

  /**
   * Generates a time-series chart of member growth.
   * @param {string} groupId - The group ID.
   * @param {Object} options - Options object.
   * @param {string|Date} [options.startDate] - Start date.
   * @param {string|Date} [options.endDate] - End date.
   * @param {string} [options.interval='day'] - Grouping interval.
   * @returns {Promise<Array<Object>>} Member growth time-series data.
   */
  async getMemberGrowthChart(groupId, { startDate, endDate, interval = 'day' } = {}) {
    const { start, end } = this._getDateRange(startDate, endDate);

    // Get historical members before start date to calculate cumulative base
    const initialMembers = await prisma.groupMember.count({
      where: {
        groupId,
        joinedAt: { lt: start }
      }
    });

    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        joinedAt: { gte: start, lte: end }
      },
      orderBy: { joinedAt: 'asc' },
      select: { joinedAt: true }
    });

    const bucketMap = new Map();
    members.forEach(m => {
      const dateKey = m.joinedAt.toISOString().split('T')[0]; // Simple YYYY-MM-DD grouping
      bucketMap.set(dateKey, (bucketMap.get(dateKey) || 0) + 1);
    });

    // Generate consecutive dates
    const series = [];
    let currentTotal = initialMembers;
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const newM = bucketMap.get(dateKey) || 0;
      currentTotal += newM;
      
      series.push({
        date: dateKey,
        newMembers: newM,
        totalMembers: currentTotal
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return series;
  }

  /**
   * Generates a time-series chart of engagement metrics.
   * @param {string} groupId - The group ID.
   * @param {Object} options - Options object.
   * @param {string|Date} [options.startDate] - Start date.
   * @param {string|Date} [options.endDate] - End date.
   * @returns {Promise<Array<Object>>} Engagement trends time-series data.
   */
  async getEngagementTrends(groupId, { startDate, endDate } = {}) {
    const { start, end } = this._getDateRange(startDate, endDate);

    const posts = await prisma.post.findMany({
      where: { groupId, createdAt: { gte: start, lte: end } },
      select: { createdAt: true }
    });
    
    const comments = await prisma.comment.findMany({
      where: { post: { groupId }, createdAt: { gte: start, lte: end } },
      select: { createdAt: true }
    });

    const likes = await prisma.like.findMany({
      where: { post: { groupId }, createdAt: { gte: start, lte: end } },
      select: { createdAt: true }
    });

    const bucketMap = new Map();

    const addToBucket = (date, type) => {
      const key = date.toISOString().split('T')[0];
      if (!bucketMap.has(key)) {
        bucketMap.set(key, { posts: 0, comments: 0, likes: 0 });
      }
      bucketMap.get(key)[type]++;
    };

    posts.forEach(p => addToBucket(p.createdAt, 'posts'));
    comments.forEach(c => addToBucket(c.createdAt, 'comments'));
    likes.forEach(l => addToBucket(l.createdAt, 'likes'));

    const series = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const key = currentDate.toISOString().split('T')[0];
      series.push({
        date: key,
        ...(bucketMap.get(key) || { posts: 0, comments: 0, likes: 0 })
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return series;
  }

  /**
   * Gets analytics for all published courses in a group.
   * @param {string} groupId - The group ID.
   * @returns {Promise<Object>} Course analytics data.
   */
  async getCourseAnalytics(groupId) {
    const courses = await prisma.course.findMany({
      where: { groupId, isPublished: true },
      include: {
        lessons: {
          where: { isPublished: true }
        }
      }
    });

    // We can compute member access count or query it per course
    const totalGroupMembers = await prisma.groupMember.count({
      where: { groupId }
    });

    const coursesAnalytics = await Promise.all(courses.map(async (course) => {
      const lessonCount = course.lessons.length;

      // Assuming CourseProgress tracks lesson completions
      // Finding members who completed all published lessons
      let completedMembersCount = 0;
      let averageProgress = 0;

      if (lessonCount > 0) {
        const progresses = await prisma.courseProgress.findMany({
          where: { courseId: course.id }
        });
        
        const completionsMap = new Map();
        progresses.forEach(p => {
          if (p.isCompleted) {
            completionsMap.set(p.userId, (completionsMap.get(p.userId) || 0) + 1);
          }
        });

        let totalProgressPct = 0;
        let activeMembersInCourse = 0;

        completionsMap.forEach(count => {
          activeMembersInCourse++;
          const pct = (count / lessonCount) * 100;
          totalProgressPct += pct;
          if (count >= lessonCount) {
            completedMembersCount++;
          }
        });

        averageProgress = activeMembersInCourse > 0 ? (totalProgressPct / activeMembersInCourse) : 0;
      }

      return {
        id: course.id,
        title: course.title,
        totalAccessibleMembers: totalGroupMembers,
        publishedLessonsCount: lessonCount,
        completedMembersCount,
        averageProgressPercentage: averageProgress,
        topCompletedLessons: [] // Could be implemented by querying specific lesson completions
      };
    }));

    return { courses: coursesAnalytics };
  }

  /**
   * Gets revenue and transaction analytics for a group.
   * @param {string} groupId - The group ID.
   * @param {Object} options - Options object.
   * @param {string|Date} [options.startDate] - Start date.
   * @param {string|Date} [options.endDate] - End date.
   * @returns {Promise<Object>} Revenue analytics data.
   */
  async getRevenueAnalytics(groupId, { startDate, endDate } = {}) {
    const { start, end } = this._getDateRange(startDate, endDate);

    // Fetch active subscriptions
    const activeSubscriptionsAgg = await prisma.subscription.aggregate({
      where: { groupId, status: 'ACTIVE' },
      _count: true,
      _sum: { amount: true }
    });

    const activeSubscriptionsCount = activeSubscriptionsAgg._count || 0;
    const mrr = activeSubscriptionsAgg._sum.amount || 0;

    // Fetch transactions in range
    const transactionsAgg = await prisma.paymentTransaction.aggregate({
      where: {
        groupId,
        status: 'SUCCEEDED',
        createdAt: { gte: start, lte: end }
      },
      _count: true,
      _sum: { amount: true }
    });

    const totalRevenueInRange = transactionsAgg._sum.amount || 0;
    const transactionsCount = transactionsAgg._count || 0;

    // Conversion rate: paying members / total members
    const totalMembers = await prisma.groupMember.count({ where: { groupId } });
    const payingMembers = await prisma.subscription.count({
      where: { groupId, status: 'ACTIVE' } // simplified assumption
    });

    const conversionRate = totalMembers > 0 ? (payingMembers / totalMembers) * 100 : 0;

    return {
      mrr,
      activeSubscriptions: activeSubscriptionsCount,
      totalRevenueInRange,
      transactionsCount,
      conversionRate
    };
  }

  /**
   * Gets a high-level overview of platform metrics for Super Admins.
   * @param {Object} user - The requesting user.
   * @returns {Promise<Object>} Platform overview data.
   */
  async getPlatformOverview(user) {
    if (!user || !user.isSuperAdmin) {
      throw new ForbiddenError('Super admin access required');
    }

    const totalUsers = await prisma.user.count();
    
    const groups = await prisma.group.findMany({
      select: { isPublic: true, price: true }
    });
    
    const totalGroups = groups.length;
    const publicGroups = groups.filter(g => g.isPublic).length;
    const privateGroups = totalGroups - publicGroups;
    const paidGroups = groups.filter(g => g.price && g.price > 0).length;
    const freeGroups = totalGroups - paidGroups;

    const subscriptions = await prisma.subscription.aggregate({
      where: { status: 'ACTIVE' },
      _count: true,
      _sum: { amount: true }
    });

    const totalSubscriptions = subscriptions._count || 0;
    // Platform MRR could be a percentage of total MRR or sum of platform fees
    const platformMrr = subscriptions._sum.amount || 0;

    return {
      totalUsers,
      totalGroups: {
        total: totalGroups,
        public: publicGroups,
        private: privateGroups,
        paid: paidGroups,
        free: freeGroups
      },
      totalSubscriptions,
      platformMrr,
      status: 'healthy'
    };
  }
}

export const analyticsService = new AnalyticsService();
