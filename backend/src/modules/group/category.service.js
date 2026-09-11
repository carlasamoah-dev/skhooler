/**
 * Category service for group management
 */
import { prisma } from '../../config/database.js'
import { logger } from '../../utils/logger.js'
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/errors.js'
import { generateSlug } from '../../utils/slugify.js'

class CategoryService {
  /**
   * Creates a new category for a group
   * @param {string} groupId 
   * @param {Object} data
   * @param {string} data.name
   * @returns {Promise<Object>}
   */
  async createCategory(groupId, { name }) {
    let slug = generateSlug(name)
    
    // Check unique (groupId + slug)
    let existing = await prisma.category.findUnique({
      where: {
        groupId_slug: {
          groupId,
          slug
        }
      }
    })

    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`
    }

    const maxPositionCategory = await prisma.category.findFirst({
      where: { groupId },
      orderBy: { position: 'desc' }
    })

    const position = maxPositionCategory ? maxPositionCategory.position + 1 : 1

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        position,
        groupId
      }
    })

    return category
  }

  /**
   * Gets all categories for a group
   * @param {string} groupId 
   * @returns {Promise<Array>}
   */
  async getCategories(groupId) {
    return prisma.category.findMany({
      where: { groupId },
      orderBy: { position: 'asc' }
    })
  }

  /**
   * Updates a category
   * @param {string} groupId 
   * @param {string} categoryId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateCategory(groupId, categoryId, data) {
    const existing = await prisma.category.findFirst({
      where: { id: categoryId, groupId }
    })

    if (!existing) {
      throw new NotFoundError('Category not found')
    }

    const updateData = { ...data }
    if (data.name && data.name !== existing.name) {
      updateData.slug = generateSlug(data.name)
      // Check unique
      const slugExists = await prisma.category.findUnique({
        where: {
          groupId_slug: {
            groupId,
            slug: updateData.slug
          }
        }
      })
      if (slugExists && slugExists.id !== categoryId) {
        updateData.slug = `${updateData.slug}-${Math.random().toString(36).substring(2, 8)}`
      }
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: updateData
    })
  }

  /**
   * Deletes a category
   * @param {string} groupId 
   * @param {string} categoryId 
   */
  async deleteCategory(groupId, categoryId) {
    const existing = await prisma.category.findFirst({
      where: { id: categoryId, groupId }
    })

    if (!existing) {
      throw new NotFoundError('Category not found')
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })
  }

  /**
   * Reorders categories
   * @param {string} groupId 
   * @param {Array<string>} orderedIds 
   */
  async reorderCategories(groupId, orderedIds) {
    // Verify all IDs belong to this group
    const existing = await prisma.category.findMany({
      where: {
        id: { in: orderedIds },
        groupId
      }
    })

    if (existing.length !== orderedIds.length) {
      throw new BadRequestError('Invalid category IDs provided')
    }

    await prisma.$transaction(
      orderedIds.map((id, index) => 
        prisma.category.update({
          where: { id },
          data: { position: index }
        })
      )
    )
  }
}

export const categoryService = new CategoryService()
