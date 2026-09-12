/**
 * Invite Service
 * Handles generation and management of invite links
 */

import crypto from 'crypto'
import { prisma } from '../../config/database.js'
import { env } from '../../config/env.js'
import { logger } from '../../utils/logger.js'
import { BadRequestError, NotFoundError } from '../../utils/errors.js'
import { emailQueue } from '../../jobs/queue.js'
import { joinService } from './join.service.js'

class InviteService {
  /**
   * Create a new invite link
   * @param {string} groupId 
   * @param {string} createdBy 
   * @param {object} options 
   */
  async createInvite(groupId, createdBy, { maxUses = null, expiresInDays = null } = {}) {
    const code = crypto.randomBytes(4).toString('hex')
    let expiresAt = null
    if (expiresInDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    }

    const invite = await prisma.groupInvite.create({
      data: {
        groupId,
        code,
        createdBy,
        maxUses,
        expiresAt
      }
    })

    return {
      ...invite,
      url: `${env.CLIENT_URL}/invite/${code}`
    }
  }

  /**
   * Get all invites for a group
   * @param {string} groupId 
   */
  async getInvites(groupId) {
    const invites = await prisma.groupInvite.findMany({
      where: { groupId, isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    
    return invites.map(inv => ({
      ...inv,
      url: `${env.CLIENT_URL}/invite/${inv.code}`
    }))
  }

  /**
   * Get or create a default shareable invite link
   * @param {string} groupId 
   * @param {string} createdBy 
   */
  async getOrCreateDefaultInvite(groupId, createdBy) {
    let invite = await prisma.groupInvite.findFirst({
      where: {
        groupId,
        isActive: true,
        maxUses: null,
        expiresAt: null
      }
    })

    if (!invite) {
      invite = await prisma.groupInvite.create({
        data: {
          groupId,
          code: crypto.randomBytes(4).toString('hex'),
          createdBy
        }
      })
    }

    return {
      ...invite,
      url: `${env.CLIENT_URL}/invite/${invite.code}`
    }
  }

  /**
   * Revoke an active invite
   * @param {string} groupId 
   * @param {string} inviteId 
   */
  async revokeInvite(groupId, inviteId) {
    const invite = await prisma.groupInvite.findFirst({
      where: { id: inviteId, groupId }
    })
    if (!invite) throw new NotFoundError('Invite not found')

    return prisma.groupInvite.update({
      where: { id: inviteId },
      data: { isActive: false }
    })
  }

  /**
   * Validate an invite link code
   * @param {string} code 
   */
  async validateInvite(code) {
    const invite = await prisma.groupInvite.findUnique({
      where: { code },
      include: {
        group: {
          select: { id: true, name: true, slug: true, iconUrl: true, visibility: true }
        }
      }
    })

    if (!invite || !invite.isActive) {
      throw new BadRequestError('Invalid invite link')
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new BadRequestError('Invite link has expired')
    }

    if (invite.maxUses && invite.useCount >= invite.maxUses) {
      throw new BadRequestError('Invite link has reached its maximum uses')
    }

    await prisma.groupInvite.update({
      where: { id: invite.id },
      data: { useCount: { increment: 1 } }
    })

    return invite
  }

  /**
   * Read-only check: validates an invite code without incrementing the use count.
   * Used by the public /validate endpoint so unauthenticated clients can check
   * validity before being asked to log in.
   * @param {string} code
   */
  async peekInvite(code) {
    const invite = await prisma.groupInvite.findUnique({
      where: { code },
      include: {
        group: {
          select: { id: true, name: true, slug: true, iconUrl: true, visibility: true }
        }
      }
    })

    if (!invite || !invite.isActive) return null
    if (invite.expiresAt && invite.expiresAt < new Date()) return null
    if (invite.maxUses && invite.useCount >= invite.maxUses) return null

    return invite
  }

  /**
   * Join a group via an invite link
   * @param {string} code 
   * @param {string} userId 
   */
  async joinViaInvite(code, userId) {
    const invite = await this.validateInvite(code)
    const { groupId } = invite
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { membershipQuestions: true }
    })

    const existingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    })
    if (existingMember) {
      return { status: 'already_member' }
    }

    if (group.joinApproval === 'MANUAL' && group.membershipQuestions.length > 0) {
      return { status: 'requires_approval', groupSlug: group.slug }
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupMember.create({
        data: {
          groupId,
          userId,
          role: 'MEMBER'
        }
      })
      await tx.group.update({
        where: { id: groupId },
        data: { memberCount: { increment: 1 } }
      })
    })

    return { status: 'joined', group: invite.group }
  }

  /**
   * Send invite emails
   * @param {string} groupId 
   * @param {string[]} emails 
   * @param {string} invitedBy 
   */
  async inviteByEmail(groupId, emails, invitedBy) {
    let sent = 0
    const alreadyMembers = []

    const [group, inviter] = await Promise.all([
      prisma.group.findUnique({ where: { id: groupId }, select: { name: true, slug: true } }),
      prisma.user.findUnique({ where: { id: invitedBy }, select: { firstName: true, lastName: true } })
    ])

    if (!group) throw new NotFoundError('Group not found')

    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : null

    for (const email of emails) {
      // Check if the email belongs to an existing member — skip if so
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        const existingMember = await prisma.groupMember.findUnique({
          where: { groupId_userId: { groupId, userId: existingUser.id } }
        })
        if (existingMember) {
          alreadyMembers.push(email)
          continue
        }
      }

      // Generate a single-use invite for this email
      const invite = await this.createInvite(groupId, invitedBy, { maxUses: 1, expiresInDays: 7 })

      // Queue the email (works for both registered and unregistered users)
      await emailQueue.add('sendEmail', {
        type: 'group-invite',
        to: email,
        data: {
          groupName: group.name,
          inviteUrl: invite.url,
          inviterName
        }
      })

      sent++
    }

    return { sent, alreadyMembers }
  }
}

export const inviteService = new InviteService()
