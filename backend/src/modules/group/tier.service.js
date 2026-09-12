/**
 * Tier service for group management
 */
import { prisma } from '../../config/database.js'
import { logger } from '../../utils/logger.js'
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/errors.js'

class TierService {
  /**
   * Creates a new tier
   * @param {string} groupId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createTier(groupId, { name }) {
    const existing = await prisma.memberTier.findFirst({
      where: { groupId, name }
    })

    if (existing) {
      throw new ConflictError('Tier with this name already exists in the group')
    }

    const maxPositionTier = await prisma.memberTier.findFirst({
      where: { groupId },
      orderBy: { position: 'desc' }
    })

    const position = maxPositionTier ? maxPositionTier.position + 1 : 1

    return prisma.memberTier.create({
      data: {
        name,
        position,
        groupId
      }
    })
  }

  /**
   * Gets tiers
   * @param {string} groupId 
   * @returns {Promise<Array>}
   */
  async getTiers(groupId) {
    return prisma.memberTier.findMany({
      where: { groupId },
      orderBy: { position: 'asc' }
    })
  }

  /**
   * Updates tier
   * @param {string} groupId 
   * @param {string} tierId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateTier(groupId, tierId, data) {
    const existing = await prisma.memberTier.findFirst({
      where: { id: tierId, groupId }
    })

    if (!existing) {
      throw new NotFoundError('Tier not found')
    }

    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.memberTier.findFirst({
        where: { groupId, name: data.name }
      })
      if (nameExists) {
        throw new ConflictError('Tier with this name already exists in the group')
      }
    }

    return prisma.memberTier.update({
      where: { id: tierId },
      data
    })
  }

  /**
   * Deletes a tier
   * @param {string} groupId 
   * @param {string} tierId 
   */
  async deleteTier(groupId, tierId) {
    const existing = await prisma.memberTier.findFirst({
      where: { id: tierId, groupId }
    })

    if (!existing) {
      throw new NotFoundError('Tier not found')
    }

    // Check if any members are assigned to this tier
    const membersCount = await prisma.groupMember.count({
      where: { tierId }
    })

    if (membersCount > 0) {
      throw new BadRequestError('Cannot delete tier with assigned members. Reassign them first.')
    }

    await prisma.memberTier.delete({
      where: { id: tierId }
    })
  }
}

export const tierService = new TierService()
