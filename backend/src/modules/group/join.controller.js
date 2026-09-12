/**
 * Controller for group join requests and membership flow
 */
import { joinService } from './join.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Join a group or submit a join request
 */
export async function joinGroup(req, res, next) {
  try {
    const { id: groupId } = req.group
    const { id: userId } = req.user
    const { answers } = req.body

    const result = await joinService.joinGroup(groupId, userId, { answers })

    if (result.status === 'joined') {
      return sendSuccess(res, result, 201)
    }

    // Pending
    return sendSuccess(res, result, 202, { message: 'Join request submitted, awaiting approval' })
  } catch (error) {
    next(error)
  }
}

/**
 * Get join requests for a group
 */
export async function getJoinRequests(req, res, next) {
  try {
    const { id: groupId } = req.group
    
    const result = await joinService.getJoinRequests(groupId, req.query)
    
    return sendSuccess(res, { data: result.data, meta: result.meta })
  } catch (error) {
    next(error)
  }
}

/**
 * Approve a join request
 */
export async function approveRequest(req, res, next) {
  try {
    const { id: groupId } = req.group
    const { requestId } = req.params
    const { id: userId } = req.user

    await joinService.approveRequest(groupId, requestId, userId)

    return sendSuccess(res, null, 200, { message: 'Member approved' })
  } catch (error) {
    next(error)
  }
}

/**
 * Decline a join request
 */
export async function declineRequest(req, res, next) {
  try {
    const { id: groupId } = req.group
    const { requestId } = req.params
    const { id: userId } = req.user

    await joinService.declineRequest(groupId, requestId, userId)

    return sendSuccess(res, null, 200, { message: 'Request declined' })
  } catch (error) {
    next(error)
  }
}

/**
 * Leave a group
 */
export async function leaveGroup(req, res, next) {
  try {
    const { id: groupId } = req.group
    const { id: userId } = req.user

    await joinService.leaveGroup(groupId, userId)

    return sendSuccess(res, null, 200, { message: 'You have left the group' })
  } catch (error) {
    next(error)
  }
}

/**
 * Get member profile
 */
export async function getMemberProfile(req, res, next) {
  try {
    const { id: groupId } = req.group
    const { memberId } = req.params

    const profile = await joinService.getMemberProfile(groupId, memberId)

    return sendSuccess(res, profile, 200)
  } catch (error) {
    next(error)
  }
}
