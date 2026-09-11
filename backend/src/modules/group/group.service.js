/**
 * @fileoverview Service layer for group module containing business logic.
 */

import { prisma } from '../../config/database.js'
import { logger } from '../../utils/logger.js'
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors.js'
import { generateUniqueSlug } from '../../utils/slugify.js'
import { decodeCursor, encodeCursor, buildPaginationMeta } from '../../utils/pagination.js'

class GroupService {
  /**
   * Create a new group
   * @param {string} userId - ID of the creating user
   * @param {Object} data - Group creation data
   * @returns {Promise<Object>} Created group
   */
  async createGroup(userId, data) {
    const slug = await generateUniqueSlug(data.name, async (s) => {
      const existing = await prisma.group.findUnique({ where: { slug: s } })
      return !!existing
    })

    return prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          ...data,
          slug,
          ownerId: userId,
          memberCount: 1,
          members: {
            create: {
              userId,
              role: 'OWNER'
            }
          }
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        }
      })
      return group
    })
  }

  /**
   * Get full group details by slug
   * @param {string} slug - Group slug
   * @param {string|null} userId - Current user ID (optional)
   * @returns {Promise<Object>} Group data
   */
  async getGroupBySlug(slug, userId = null) {
    const group = await prisma.group.findFirst({
      where: {
        slug,
        deletedAt: null
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        categories: {
          include: {
            _count: { select: { posts: true } }
          },
          orderBy: { position: 'asc' }
        },
        memberTiers: true,
        externalLinks: true,
        _count: {
          select: { members: true }
        }
      }
    })

    if (!group) throw new NotFoundError('Group not found')

    let userMembership = null
    if (userId) {
      userMembership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId: group.id, userId }
        }
      })
    }

    return { ...group, userMembership }
  }

  /**
   * Get limited public landing page data for a group
   * @param {string} slug - Group slug
   * @returns {Promise<Object>} Landing page data
   */
  async getGroupLanding(slug) {
    const group = await prisma.group.findFirst({
      where: {
        slug,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        coverUrl: true,
        visibility: true,
        pricingModel: true,
        price: true,
        billingInterval: true,
        memberCount: true,
        owner: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        categories: {
          select: { name: true, slug: true }
        }
      }
    })

    if (!group) throw new NotFoundError('Group not found')

    if (group.visibility === 'PRIVATE') {
      return {
        id: group.id,
        name: group.name,
        description: group.description,
        iconUrl: group.iconUrl,
        visibility: group.visibility,
        isLimited: true
      }
    }

    return { ...group, isLimited: false }
  }

  /**
   * Update group details
   * @param {string} groupId - Group ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated group
   */
  async updateGroup(groupId, data) {
    const updateData = { ...data }
    
    // If slug is explicitly provided, validate its uniqueness
    if (updateData.slug) {
      const existing = await prisma.group.findFirst({
        where: { slug: updateData.slug, id: { not: groupId } }
      })
      if (existing) {
        throw new ConflictError('This community URL is already taken')
      }
    } 
    // Otherwise, if name is changed but no explicit slug is provided, generate a new one
    else if (updateData.name) {
      updateData.slug = await generateUniqueSlug(updateData.name, async (s) => {
        const existing = await prisma.group.findFirst({
          where: { slug: s, id: { not: groupId } }
        })
        return !!existing
      })
    }

    return prisma.group.update({
      where: { id: groupId },
      data: updateData
    })
  }

  /**
   * Update group pricing details
   * @param {string} groupId - Group ID
   * @param {Object} data - Pricing data
   * @returns {Promise<Object>} Updated group
   */
  async updateGroupPricing(groupId, data) {
    const updateData = { ...data }
    
    if (updateData.pricingModel === 'FREE') {
      updateData.price = null
      updateData.billingInterval = null
    }

    return prisma.group.update({
      where: { id: groupId },
      data: updateData
    })
  }

  /**
   * Soft delete a group
   * @param {string} groupId - Group ID
   * @returns {Promise<void>}
   */
  async deleteGroup(groupId) {
    await prisma.group.update({
      where: { id: groupId },
      data: { deletedAt: new Date() }
    })
  }

  /**
   * Get group members with pagination
   * @param {string} groupId - Group ID
   * @param {Object} query - Pagination and filter query
   * @returns {Promise<Object>} Members list and meta
   */
  async getGroupMembers(groupId, { cursor, limit = 20, role }) {
    const take = parseInt(limit, 10) || 20
    const decodedCursor = decodeCursor(cursor)

    const where = {
      groupId,
      ...(role && { role })
    }

    const members = await prisma.groupMember.findMany({
      where,
      take: take + 1,
      cursor: decodedCursor ? { id: decodedCursor.id } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, bio: true }
        },
        tier: true
      }
    })

    const meta = buildPaginationMeta(members, take)
    const data = members.slice(0, take).map(m => ({ ...m, cursor: encodeCursor({ id: m.id }) }))

    return { data, meta }
  }

  /**
   * Update a member's role
   * @param {string} groupId - Group ID
   * @param {string} memberId - Member user ID
   * @param {string} newRole - New role
   * @param {string} actingUserId - ID of user making the change
   * @returns {Promise<Object>} Updated membership
   */
  async updateMemberRole(groupId, memberId, newRole, actingUserId) {
    if (memberId === actingUserId) {
      throw new ForbiddenError('Cannot change your own role')
    }

    const targetMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: memberId } }
    })

    if (!targetMember) throw new NotFoundError('Member not found')
    if (targetMember.role === 'OWNER') {
      throw new ForbiddenError('Cannot change owner role')
    }

    const actingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actingUserId } }
    })

    if (newRole === 'ADMIN' && actingMember.role !== 'OWNER') {
      throw new ForbiddenError('Only owner can assign ADMIN role')
    }
    if (newRole === 'MODERATOR' && !['OWNER', 'ADMIN'].includes(actingMember.role)) {
      throw new ForbiddenError('Only Owner or Admin can assign MODERATOR role')
    }

    return prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId: memberId } },
      data: { role: newRole }
    })
  }

  /**
   * Update a member's tier
   * @param {string} groupId - Group ID
   * @param {string} memberId - Member user ID
   * @param {string} tierId - Tier ID
   * @returns {Promise<Object>} Updated membership
   */
  async updateMemberTier(groupId, memberId, tierId) {
    if (tierId) {
      const tier = await prisma.memberTier.findUnique({
        where: { id: tierId }
      })
      if (!tier || tier.groupId !== groupId) {
        throw new NotFoundError('Tier not found in this group')
      }
    }

    return prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId: memberId } },
      data: { tierId }
    })
  }

  /**
   * Remove a member from the group
   * @param {string} groupId - Group ID
   * @param {string} memberId - Member user ID
   * @param {string} actingUserId - ID of user making the change
   * @returns {Promise<void>}
   */
  async removeMember(groupId, memberId, actingUserId) {
    const targetMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: memberId } }
    })

    if (!targetMember) throw new NotFoundError('Member not found')

    const actingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actingUserId } }
    })

    if (memberId === actingUserId) {
      if (targetMember.role === 'OWNER') {
        throw new ForbiddenError('Owner cannot leave group without transferring ownership')
      }
    } else {
      const roleWeights = { OWNER: 3, ADMIN: 2, MODERATOR: 1, MEMBER: 0 }
      if (roleWeights[targetMember.role] >= roleWeights[actingMember.role]) {
        throw new ForbiddenError('Cannot remove a member with equal or higher role')
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupMember.delete({
        where: { groupId_userId: { groupId, userId: memberId } }
      })
      
      await tx.group.update({
        where: { id: groupId },
        data: { memberCount: { decrement: 1 } }
      })
    })

    logger.info(`Member ${memberId} removed from group ${groupId} by ${actingUserId}`)
  }

  /**
   * Discover public groups with filtering and ranking
   * Ranking: composite score = memberCount + recentPostCount*3 + newnessBonus
   * @param {Object} options - Discovery options
   * @param {string} [options.q] - Text search query
   * @param {string} [options.tag] - Category tag filter
   * @param {string} [options.pricing] - Pricing filter: 'FREE' | 'PAID'
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=9] - Items per page
   * @returns {Promise<Object>} Paginated groups with ranking
   */
  async discoverGroups({ q, tag, pricing, page = 1, limit = 9 }) {
    const skip = (page - 1) * limit

    const where = {
      deletedAt: null,
      visibility: 'PUBLIC',
      ...(pricing && { pricingModel: pricing }),
      ...(tag && { tags: { has: tag } }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
    }

    // Fetch a larger pool for in-memory ranking (up to 500 for performance)
    const RANK_POOL = Math.max(limit * 20, 200)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [allGroups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        take: RANK_POOL,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          iconUrl: true,
          coverUrl: true,
          visibility: true,
          pricingModel: true,
          price: true,
          billingInterval: true,
          trialDays: true,
          tags: true,
          memberCount: true,
          createdAt: true,
          owner: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          _count: {
            select: {
              posts: {
                where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
              },
            },
          },
        },
        orderBy: { memberCount: 'desc' }, // Pre-sort for DB efficiency
      }),
      prisma.group.count({ where }),
    ])

    // Composite ranking score
    const now = Date.now()
    const ranked = allGroups
      .map((g) => {
        const recentPosts = g._count.posts
        // Newness bonus: groups newer than 30 days get a boost, fading over time
        const ageMs = now - new Date(g.createdAt).getTime()
        const ageDays = ageMs / (1000 * 60 * 60 * 24)
        const newnessBonus = Math.max(0, 30 - ageDays) * 0.5
        const score = g.memberCount * 0.5 + recentPosts * 3 + newnessBonus
        return { ...g, _score: score }
      })
      .sort((a, b) => b._score - a._score)

    const paginated = ranked.slice(skip, skip + limit).map(({ _score, _count, ...g }) => ({
      ...g,
      recentPostCount: _count?.posts ?? 0,
    }))

    return {
      groups: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }
}

export const groupService = new GroupService()
