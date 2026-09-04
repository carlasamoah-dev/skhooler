/**
 * @fileoverview Controller layer for the group module.
 */

import { sendSuccess } from '../../utils/apiResponse.js'
import { groupService } from './group.service.js'

/**
 * Create a new group
 */
export async function createGroup(req, res, next) {
  try {
    const group = await groupService.createGroup(req.user.id, req.body)
    sendSuccess(res, group, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get full group details by slug
 */
export async function getGroup(req, res, next) {
  try {
    const userId = req.user?.id
    const group = await groupService.getGroupBySlug(req.params.slug, userId)
    sendSuccess(res, group)
  } catch (error) {
    next(error)
  }
}

/**
 * Get public group landing details
 */
export async function getGroupLanding(req, res, next) {
  try {
    const landing = await groupService.getGroupLanding(req.params.slug)
    sendSuccess(res, landing)
  } catch (error) {
    next(error)
  }
}

/**
 * Update group basic details
 */
export async function updateGroup(req, res, next) {
  try {
    const updated = await groupService.updateGroup(req.group.id, req.body)
    sendSuccess(res, updated)
  } catch (error) {
    next(error)
  }
}

/**
 * Update group pricing settings
 */
export async function updateGroupPricing(req, res, next) {
  try {
    const updated = await groupService.updateGroupPricing(req.group.id, req.body)
    sendSuccess(res, updated)
  } catch (error) {
    next(error)
  }
}

/**
 * Soft delete a group
 */
export async function deleteGroup(req, res, next) {
  try {
    await groupService.deleteGroup(req.group.id)
    sendSuccess(res, { message: 'Group deleted successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Get paginated list of group members
 */
export async function getMembers(req, res, next) {
  try {
    const result = await groupService.getGroupMembers(req.group.id, req.query)
    sendSuccess(res, result.data, 200, result.meta)
  } catch (error) {
    next(error)
  }
}

/**
 * Update a member's role
 */
export async function updateMemberRole(req, res, next) {
  try {
    const result = await groupService.updateMemberRole(req.group.id, req.params.memberId, req.body.role, req.user.id)
    sendSuccess(res, result)
  } catch (error) {
    next(error)
  }
}

/**
 * Update a member's tier
 */
export async function updateMemberTier(req, res, next) {
  try {
    const result = await groupService.updateMemberTier(req.group.id, req.params.memberId, req.body.tierId)
    sendSuccess(res, result)
  } catch (error) {
    next(error)
  }
}

/**
 * Remove a member from the group
 */
export async function removeMember(req, res, next) {
  try {
    await groupService.removeMember(req.group.id, req.params.memberId, req.user.id)
    sendSuccess(res, { message: 'Member removed successfully' })
  } catch (error) {
    next(error)
  }
}
