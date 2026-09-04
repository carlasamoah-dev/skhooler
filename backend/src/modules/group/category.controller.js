/**
 * Category controller for group management
 */
import { categoryService } from './category.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Create category
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.group.id, req.body)
    sendSuccess(res, category, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get categories
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getCategories(req.group.id)
    sendSuccess(res, categories, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Update category
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function updateCategory(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.group.id, req.params.categoryId, req.body)
    sendSuccess(res, category, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete category
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function deleteCategory(req, res, next) {
  try {
    await categoryService.deleteCategory(req.group.id, req.params.categoryId)
    sendSuccess(res, { message: 'Category deleted successfully' }, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Reorder categories
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function reorderCategories(req, res, next) {
  try {
    await categoryService.reorderCategories(req.group.id, req.body.orderedIds)
    sendSuccess(res, { message: 'Categories reordered successfully' }, 200)
  } catch (error) {
    next(error)
  }
}
