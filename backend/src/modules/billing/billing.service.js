import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { decodeCursor, encodeCursor, buildPaginationMeta } from '../../utils/pagination.js';
import crypto from 'crypto';

/**
 * Service for handling Billing, Payment, and Referrals
 */
class BillingService {
  /**
   * Simulates a dummy checkout for group membership
   * @param {string} userId - ID of the user
   * @param {Object} options - Checkout options
   * @param {string} options.groupSlug - Slug of the group
   * @param {string} [options.billingInterval='MONTHLY'] - Billing interval ('MONTHLY' or 'YEARLY')
   * @returns {Promise<Object>} Checkout result
   */
  async simulateDummyMembershipCheckout(userId, { groupSlug, billingInterval = 'MONTHLY' }) {
    const group = await prisma.group.findUnique({
      where: { slug: groupSlug }
    });

    if (!group) {
      throw new NotFoundError('Group not found');
    }

    if (group.pricingModel === 'FREE') {
      throw new BadRequestError('Group is free to join');
    }

    let price = Number(group.price || 0);
    if (billingInterval === 'YEARLY') {
      price = price * 10;
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    if (billingInterval === 'YEARLY') {
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 365);
    } else {
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
    }

    return await prisma.$transaction(async (tx) => {
      let subscription = await tx.subscription.findFirst({
        where: { userId, groupId: group.id, type: 'GROUP_MEMBERSHIP' }
      });

      if (subscription) {
        subscription = await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            amount: price,
            billingInterval,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: false,
            canceledAt: null
          }
        });
      } else {
        subscription = await tx.subscription.create({
          data: {
            userId,
            groupId: group.id,
            type: 'GROUP_MEMBERSHIP',
            status: 'ACTIVE',
            amount: price,
            billingInterval,
            currency: 'USD',
            currentPeriodStart,
            currentPeriodEnd
          }
        });
      }

      const transaction = await tx.paymentTransaction.create({
        data: {
          subscriptionId: subscription.id,
          userId,
          groupId: group.id,
          amount: price,
          isDummy: true,
          status: 'SUCCEEDED',
          description: `Membership payment for ${group.name} (${billingInterval})`
        }
      });

      const member = await tx.groupMember.findUnique({
        where: {
          groupId_userId: { groupId: group.id, userId }
        }
      });

      if (!member) {
        await tx.groupMember.create({
          data: {
            groupId: group.id,
            userId,
            role: 'MEMBER',
            joinedAt: new Date()
          }
        });
        await tx.group.update({
          where: { id: group.id },
          data: { memberCount: { increment: 1 } }
        });
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { referredBy: true }
      });

      const referral = Array.isArray(user?.referredBy) ? user.referredBy[0] : user?.referredBy;

      if (referral) {
        const commission = price * 0.40;
        const availableAt = new Date();
        availableAt.setDate(availableAt.getDate() + 14);

        await tx.referralEarning.create({
          data: {
            referralId: referral.id,
            referrerId: referral.referrerId,
            transactionId: transaction.id,
            amount: commission,
            commissionRate: 0.40,
            status: 'PENDING',
            availableAt
          }
        });
      }

      return { success: true, isDummy: true, subscription, transaction, group };
    });
  }

  /**
   * Simulates a dummy checkout for platform plans
   * @param {string} userId - ID of the user
   * @param {Object} options - Checkout options
   * @param {string} options.planId - Plan ID ('starter', 'pro', 'custom')
   * @param {string} [options.billingInterval='MONTHLY'] - Billing interval
   * @returns {Promise<Object>} Checkout result
   */
  async simulateDummyPlatformCheckout(userId, { planId, billingInterval = 'MONTHLY' }) {
    let price = 0;
    if (planId === 'starter') {
      price = billingInterval === 'YEARLY' ? 290 : 29;
    } else if (planId === 'pro') {
      price = billingInterval === 'YEARLY' ? 790 : 79;
    } else if (planId === 'custom') {
      price = 49;
    } else {
      throw new BadRequestError('Invalid planId');
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    if (billingInterval === 'YEARLY') {
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 365);
    } else {
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
    }

    return await prisma.$transaction(async (tx) => {
      let subscription = await tx.subscription.findFirst({
        where: { userId, type: 'PLATFORM_OWNER' }
      });

      if (subscription) {
        subscription = await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            planId,
            amount: price,
            billingInterval,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: false,
            canceledAt: null
          }
        });
      } else {
        subscription = await tx.subscription.create({
          data: {
            userId,
            type: 'PLATFORM_OWNER',
            status: 'ACTIVE',
            planId,
            amount: price,
            billingInterval,
            currency: 'USD',
            currentPeriodStart,
            currentPeriodEnd
          }
        });
      }

      const transaction = await tx.paymentTransaction.create({
        data: {
          subscriptionId: subscription.id,
          userId,
          amount: price,
          isDummy: true,
          status: 'SUCCEEDED',
          description: `Platform subscription payment (${planId} - ${billingInterval})`
        }
      });

      return { success: true, isDummy: true, subscription, transaction };
    });
  }

  /**
   * Retrieves all subscriptions for a user
   * @param {string} userId - ID of the user
   * @returns {Promise<Array>} List of subscriptions
   */
  async getUserSubscriptions(userId) {
    return await prisma.subscription.findMany({
      where: { userId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Retrieves payment history for a user
   * @param {string} userId - ID of the user
   * @param {Object} options - Pagination options
   * @param {string} [options.cursor] - Pagination cursor
   * @param {number} [options.limit=20] - Number of records
   * @returns {Promise<Object>} Paginated payment history
   */
  async getUserPaymentHistory(userId, { cursor, limit = 20 }) {
    const take = limit + 1;
    const decodedCursor = decodeCursor(cursor);

    const transactions = await prisma.paymentTransaction.findMany({
      where: { userId },
      take,
      ...(decodedCursor && {
        skip: 1,
        cursor: { id: decodedCursor }
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true
          }
        }
      }
    });

    const meta = buildPaginationMeta(transactions, limit);
    if (transactions.length > limit) {
      transactions.pop();
    }

    return {
      data: transactions,
      meta
    };
  }

  /**
   * Cancels a user subscription
   * @param {string} userId - ID of the user
   * @param {string} subscriptionId - ID of the subscription
   * @returns {Promise<Object>} Updated subscription
   */
  async cancelSubscription(userId, subscriptionId) {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId }
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date()
      }
    });
  }

  /**
   * Gets referral statistics for a user
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} Referral stats
   */
  async getReferralStats(userId) {
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.referralCode) {
      const code = crypto.randomBytes(4).toString('hex');
      user = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code }
      });
    }

    const totalReferrals = await prisma.referral.count({
      where: { referrerId: userId }
    });

    const earnings = await prisma.referralEarning.findMany({
      where: { referrerId: userId }
    });

    let totalEarned = 0;
    let pendingBalance = 0;
    let availableBalance = 0;
    let paidBalance = 0;

    earnings.forEach(earning => {
      const amount = Number(earning.amount);
      totalEarned += amount;
      if (earning.status === 'PENDING') pendingBalance += amount;
      if (earning.status === 'AVAILABLE') availableBalance += amount;
      if (earning.status === 'PAID') paidBalance += amount;
    });

    const recentEarnings = await prisma.referralEarning.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        referral: {
          include: {
            referredUser: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    return {
      referralCode: user.referralCode,
      referralUrl: `${env.CLIENT_URL}/r/${user.referralCode}`,
      totalReferrals,
      totalEarned,
      pendingBalance,
      availableBalance,
      paidBalance,
      recentEarnings
    };
  }

  /**
   * Tracks a referral cookie/visit
   * @param {string} referrerCode - The referral code
   * @param {string} ipAddress - IP address of the visitor
   * @returns {Promise<Object>} Referrer information
   */
  async trackReferralCookie(referrerCode, ipAddress) {
    const referrer = await prisma.user.findFirst({
      where: { referralCode: referrerCode }
    });

    if (!referrer) {
      throw new NotFoundError('Referrer not found');
    }

    return {
      referrerId: referrer.id,
      name: referrer.name,
      avatarUrl: referrer.avatarUrl
    };
  }

  /**
   * Attaches a referral to a newly registered user
   * @param {string} newUserId - ID of the new user
   * @param {string} referrerCode - The referral code used
   * @returns {Promise<void>}
   */
  async attachReferralOnRegister(newUserId, referrerCode) {
    if (!referrerCode) return;

    const referrer = await prisma.user.findFirst({
      where: { referralCode: referrerCode }
    });

    if (referrer && referrer.id !== newUserId) {
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: newUserId,
          cookieAttributedAt: new Date()
        }
      });
    }
  }
}

export const billingService = new BillingService();
