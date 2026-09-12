/**
 * Controller for group invites
 */
import { inviteService } from './invite.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Create a new invite link
 */
export async function createInvite(req, res, next) {
  try {
    const { id: groupId } = req.group
    const { id: userId } = req.user
    const { maxUses, expiresInDays } = req.body

    const invite = await inviteService.createInvite(groupId, userId, { maxUses, expiresInDays })

    return sendSuccess(res, invite, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all invites for a group
 */
export async function getInvites(req, res, next) {
  try {
    const { id: groupId } = req.group

    const invites = await inviteService.getInvites(groupId)

    return sendSuccess(res, invites, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Public validate — returns group info for an invite code (no auth required).
 * Used by the client to pre-check validity before showing the login modal.
 */
export async function validateInvite(req, res, next) {
  try {
    const { code } = req.params

    const invite = await inviteService.peekInvite(code)
    if (!invite) {
      return res.status(404).json({ error: { message: 'Invalid or expired invite link' } })
    }

    return sendSuccess(res, {
      group: {
        id: invite.group.id,
        name: invite.group.name,
        slug: invite.group.slug,
        iconUrl: invite.group.iconUrl,
        visibility: invite.group.visibility,
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get or create default share link
 */
export async function getShareLink(req, res, next) {
  try {
    const { id: groupId } = req.group
    const { id: userId } = req.user

    const invite = await inviteService.getOrCreateDefaultInvite(groupId, userId)

    return sendSuccess(res, invite, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Revoke an invite
 */
export async function revokeInvite(req, res, next) {
  try {
    const { id: groupId } = req.group
    const { inviteId } = req.params

    await inviteService.revokeInvite(groupId, inviteId)

    return sendSuccess(res, null, 200, { message: 'Invite revoked' })
  } catch (error) {
    next(error)
  }
}

/**
 * Join group via invite code
 */
export async function joinViaInvite(req, res, next) {
  try {
    const { code } = req.params
    const { id: userId } = req.user

    const result = await inviteService.joinViaInvite(code, userId)

    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Invite multiple users by email
 */
export async function inviteByEmail(req, res, next) {
  try {
    const { id: groupId } = req.group
    const { emails } = req.body
    const { id: userId } = req.user

    const result = await inviteService.inviteByEmail(groupId, emails, userId)

    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}
