/**
 * Join Service
 * Handles membership joining, requests, and moderation
 */

import { prisma } from '../../config/database.js'
import { logger } from '../../utils/logger.js'
import { BadRequestError, NotFoundError, ConflictError, ForbiddenError } from '../../utils/errors.js'
import { decodeCursor, encodeCursor, buildPaginationMeta } from '../../utils/pagination.js'

class JoinService {
  /**
   * Helper to log moderation actions
   * @param {string} groupId 
   * @param {string} actorId 
   * @param {string} action 
   * @param {string} targetType 
   * @param {string} targetId 
   * @param {object} [details=null] 
   */
  async _logModeration(groupId, actorId, action, targetType, targetId, details = null) {
    await prisma.moderationLog.create({
      data: {
        groupId,
        actorId,
        action,
        targetType,
        targetId,
        details: details ? details : undefined
      }
    })
  }

  /**
   * Join a group or submit a join request
   * @param {string} groupId 
   * @param {string} userId 
   * @param {object} options
   * @param {Array} options.answers
   */
  async joinGroup(groupId, userId, { answers = [] } = {}) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { membershipQuestions: true }
    })

    if (!group) throw new NotFoundError('Group not found')

    const existingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    })
    if (existingMember) throw new ConflictError('Already a member')

    const existingRequest = await prisma.joinRequest.findUnique({
      where: { groupId_userId: { groupId, userId } }
    })
    if (existingRequest && existingRequest.status === 'PENDING') {
      throw new ConflictError('Join request already pending')
    }

    // Check membership questions
    const requiredQuestions = group.membershipQuestions.filter(q => q.isRequired)
    const requiredQuestionIds = requiredQuestions.map(q => q.id)
    const providedQuestionIds = answers.map(a => a.questionId)

    const missing = requiredQuestionIds.filter(id => !providedQuestionIds.includes(id))
    if (missing.length > 0) {
      throw new BadRequestError('Missing required membership questions')
    }

    if (group.joinApproval === 'AUTOMATIC') {
      const membership = await prisma.$transaction(async (tx) => {
        const member = await tx.groupMember.create({
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

        if (answers.length > 0) {
          const joinRequest = await tx.joinRequest.create({
            data: {
              groupId,
              userId,
              status: 'APPROVED',
              reviewedAt: new Date()
            }
          })
          
          if (answers.length > 0) {
            await tx.joinRequestAnswer.createMany({
              data: answers.map(a => ({
                joinRequestId: joinRequest.id,
                questionId: a.questionId,
                answer: a.answer
              }))
            })
          }
        }

        return member
      })

      return { status: 'joined', membership }
    } else {
      const joinRequest = await prisma.$transaction(async (tx) => {
        const req = await tx.joinRequest.create({
          data: {
            groupId,
            userId,
            status: 'PENDING'
          }
        })

        if (answers.length > 0) {
          await tx.joinRequestAnswer.createMany({
            data: answers.map(a => ({
              joinRequestId: req.id,
              questionId: a.questionId,
              answer: a.answer
            }))
          })
        }
        return req
      })

      return { status: 'pending', joinRequest }
    }
  }

  /**
   * Get join requests for a group
   * @param {string} groupId 
   * @param {object} options 
   */
  async getJoinRequests(groupId, { status = 'PENDING', cursor, limit = 20 }) {
    const take = limit + 1
    const decodedCursor = decodeCursor(cursor)

    const where = {
      groupId,
      status
    }

    const requests = await prisma.joinRequest.findMany({
      where,
      take,
      ...(decodedCursor && {
        cursor: { id: decodedCursor },
        skip: 1
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, country: true, countryCode: true }
        },
        answers: {
          include: {
            question: { select: { question: true } }
          }
        }
      }
    })

    const meta = buildPaginationMeta(requests, limit)
    if (requests.length > limit) {
      requests.pop()
    }

    const data = requests.map(r => ({
      ...r,
      answers: r.answers.map(a => ({
        questionId: a.questionId,
        question: a.question?.question || '',
        answer: a.answer
      }))
    }))

    return {
      data,
      meta
    }
  }

  /**
   * Approve a join request
   * @param {string} groupId 
   * @param {string} requestId 
   * @param {string} reviewerId 
   */
  async approveRequest(groupId, requestId, reviewerId) {
    const request = await prisma.joinRequest.findFirst({
      where: { id: requestId, groupId, status: 'PENDING' }
    })
    
    if (!request) throw new NotFoundError('Join request not found or not pending')

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const req = await tx.joinRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: reviewerId,
          reviewedAt: new Date()
        }
      })

      await tx.groupMember.create({
        data: {
          groupId,
          userId: request.userId,
          role: 'MEMBER'
        }
      })

      await tx.group.update({
        where: { id: groupId },
        data: { memberCount: { increment: 1 } }
      })

      return req
    })

    await this._logModeration(groupId, reviewerId, 'REQUEST_APPROVED', 'JOIN_REQUEST', requestId)

    return updatedRequest
  }

  /**
   * Decline a join request
   * @param {string} groupId 
   * @param {string} requestId 
   * @param {string} reviewerId 
   */
  async declineRequest(groupId, requestId, reviewerId) {
    const request = await prisma.joinRequest.findFirst({
      where: { id: requestId, groupId, status: 'PENDING' }
    })
    
    if (!request) throw new NotFoundError('Join request not found or not pending')

    const updatedRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: {
        status: 'DECLINED',
        reviewedBy: reviewerId,
        reviewedAt: new Date()
      }
    })

    await this._logModeration(groupId, reviewerId, 'REQUEST_DECLINED', 'JOIN_REQUEST', requestId)

    return updatedRequest
  }

  /**
   * Leave a group
   * @param {string} groupId 
   * @param {string} userId 
   */
  async leaveGroup(groupId, userId) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    })

    if (!membership) throw new NotFoundError('Membership not found')
    if (membership.role === 'OWNER') {
      throw new BadRequestError('Owners cannot leave. Transfer ownership first.')
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupMember.delete({
        where: { id: membership.id }
      })
      await tx.group.update({
        where: { id: groupId },
        data: { memberCount: { decrement: 1 } }
      })
    })
  }

  /**
   * Get a member's profile in a group
   * @param {string} groupId 
   * @param {string} memberId 
   */
  async getMemberProfile(groupId, memberId) {
    const member = await prisma.groupMember.findFirst({
      where: { id: memberId, groupId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            bio: true,
            username: true,
            lastSeenAt: true,
            country: true,
            countryCode: true,
            location: true,
            isOnline: true,
            createdAt: true,
            courseAccess: {
              where: { course: { groupId } },
              select: { courseId: true }
            },
            _count: {
              select: {
                posts: { where: { groupId } },
                comments: { where: { post: { groupId } } }
              }
            }
          }
        },
        tier: true
      }
    })

    if (!member) throw new NotFoundError('Member not found')
    
    return {
      ...member,
      lastActiveAt: member.user?.lastSeenAt || member.createdAt,
      isOnline: member.user?.isOnline || false,
      postCount: member.user?._count?.posts || 0,
      commentCount: member.user?._count?.comments || 0,
      lifetimeValue: 0,
      courseAccess: member.user?.courseAccess?.map(c => c.courseId) || []
    }
  }
}

export const joinService = new JoinService()
