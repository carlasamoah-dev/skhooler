/**
 * @fileoverview Comment service
 */

import { prisma } from '../../config/database.js'
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js'

export const commentService = {
  /**
   * Create a comment
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} authorId 
   * @param {Object} data 
   * @param {string} data.content 
   * @param {string} [data.parentCommentId] 
   * @param {any} [data.attachments] 
   * @returns {Promise<Object>}
   */
  async createComment(groupId, postId, authorId, { content, parentCommentId = null, attachments = null }) {
    const post = await prisma.post.findUnique({
      where: { id: postId, groupId, deletedAt: null }
    })

    if (!post) {
      throw new NotFoundError('Post not found')
    }

    if (parentCommentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentCommentId, postId, deletedAt: null }
      })
      if (!parent) {
        throw new NotFoundError('Parent comment not found')
      }
    }

    return await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          content,
          parentCommentId,
          attachments: attachments || undefined,
          postId,
          authorId
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        }
      })

      await tx.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } }
      })

      return comment
    })
  },

  /**
   * Get comments
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} userId 
   * @param {Object} options 
   * @param {string} [options.cursor] 
   * @param {number} [options.limit=50] 
   * @returns {Promise<Object[]>}
   */
  async getComments(groupId, postId, userId, { cursor, limit = 50 }) {
    const query = {
      where: {
        postId,
        parentCommentId: null,
        deletedAt: null
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            likes: userId ? { where: { userId }, select: { id: true } } : false
          }
        },
        likes: userId ? { where: { userId }, select: { id: true } } : false
      }
    }

    if (cursor) {
      query.cursor = { id: cursor }
      query.skip = 1
    }

    const comments = await prisma.comment.findMany(query)

    return comments.map(comment => ({
      ...comment,
      likedByMe: userId ? comment.likes?.length > 0 : false,
      replies: comment.replies.map(reply => ({
        ...reply,
        likedByMe: userId ? reply.likes?.length > 0 : false
      }))
    }))
  },

  /**
   * Update comment
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} commentId 
   * @param {string} userId 
   * @param {string} userRole 
   * @param {Object} data 
   * @param {string} data.content 
   * @returns {Promise<Object>}
   */
  async updateComment(groupId, postId, commentId, userId, userRole, { content }) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId, postId, deletedAt: null }
    })

    if (!comment) {
      throw new NotFoundError('Comment not found')
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('You can only edit your own comments')
    }

    return await prisma.comment.update({
      where: { id: commentId },
      data: { content }
    })
  },

  /**
   * Delete comment
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} commentId 
   * @param {string} userId 
   * @param {string} userRole 
   * @returns {Promise<void>}
   */
  async deleteComment(groupId, postId, commentId, userId, userRole) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId, postId, deletedAt: null }
    })

    if (!comment) {
      throw new NotFoundError('Comment not found')
    }

    const isAuthor = comment.authorId === userId
    const isModerator = ['OWNER', 'ADMIN', 'MODERATOR'].includes(userRole)

    if (!isAuthor && !isModerator) {
      throw new ForbiddenError('Not authorized to delete this comment')
    }

    await prisma.$transaction(async (tx) => {
      await tx.comment.update({
        where: { id: commentId },
        data: { deletedAt: new Date() }
      })

      await tx.post.update({
        where: { id: postId },
        data: { commentCount: { decrement: 1 } }
      })
    })
  },

  /**
   * Toggle comment like
   * @param {string} groupId 
   * @param {string} commentId 
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async toggleCommentLike(groupId, commentId, userId) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId, deletedAt: null }
    })

    if (!comment) {
      throw new NotFoundError('Comment not found')
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId
        }
      }
    })

    if (existingLike) {
      await prisma.$transaction([
        prisma.commentLike.delete({
          where: { id: existingLike.id }
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } }
        })
      ])
      return { liked: false, likeCount: Math.max(0, comment.likeCount - 1) }
    } else {
      await prisma.$transaction([
        prisma.commentLike.create({
          data: { commentId, userId }
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } }
        })
      ])
      return { liked: true, likeCount: comment.likeCount + 1 }
    }
  }
}
