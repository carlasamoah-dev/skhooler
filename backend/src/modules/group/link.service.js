/**
 * Link service
 */
import { prisma } from '../../config/database.js'
import { logger } from '../../utils/logger.js'
import { BadRequestError, NotFoundError } from '../../utils/errors.js'

class LinkService {
  /**
   * Creates a link
   * @param {string} groupId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createLink(groupId, { label, url }) {
    const count = await prisma.groupLink.count({
      where: { groupId }
    })

    if (count >= 5) {
      throw new BadRequestError('Maximum 5 external links allowed')
    }

    const maxPositionLink = await prisma.groupLink.findFirst({
      where: { groupId },
      orderBy: { position: 'desc' }
    })

    const position = maxPositionLink ? maxPositionLink.position + 1 : 1

    return prisma.groupLink.create({
      data: {
        label,
        url,
        position,
        groupId
      }
    })
  }

  /**
   * Gets links
   * @param {string} groupId 
   * @returns {Promise<Array>}
   */
  async getLinks(groupId) {
    return prisma.groupLink.findMany({
      where: { groupId },
      orderBy: { position: 'asc' }
    })
  }

  /**
   * Updates a link
   * @param {string} groupId 
   * @param {string} linkId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateLink(groupId, linkId, data) {
    const existing = await prisma.groupLink.findFirst({
      where: { id: linkId, groupId }
    })

    if (!existing) {
      throw new NotFoundError('Link not found')
    }

    return prisma.groupLink.update({
      where: { id: linkId },
      data
    })
  }

  /**
   * Deletes a link
   * @param {string} groupId 
   * @param {string} linkId 
   */
  async deleteLink(groupId, linkId) {
    const existing = await prisma.groupLink.findFirst({
      where: { id: linkId, groupId }
    })

    if (!existing) {
      throw new NotFoundError('Link not found')
    }

    await prisma.groupLink.delete({
      where: { id: linkId }
    })
  }
}

export const linkService = new LinkService()
