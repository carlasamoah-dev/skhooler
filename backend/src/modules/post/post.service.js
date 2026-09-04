/**
 * @fileoverview Post service
 */

import { prisma } from '../../config/database.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors.js';
import { encodeCursor, decodeCursor } from '../../utils/pagination.js';
// import { emailQueue } from '../../jobs/queue.js';

class PostService {
  /**
   * Creates a post
   * @param {string} groupId 
   * @param {string} authorId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createPost(groupId, authorId, data) {
    const { poll, categoryId, isEmailBroadcast, ...postData } = data;

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, groupId }
      });
      if (!category) {
        throw new NotFoundError('Category not found or does not belong to this group');
      }
    }

    let pinnedAt = null;
    if (postData.isPinned) {
      pinnedAt = new Date();
    }

    const post = await prisma.$transaction(async (tx) => {
      const createdPost = await tx.post.create({
        data: {
          ...postData,
          groupId,
          authorId,
          categoryId,
          pinnedAt
        },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          }
        }
      });

      if (poll) {
        let expiresAt = null;
        if (poll.expiresInDays) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + poll.expiresInDays);
        }

        const createdPoll = await tx.poll.create({
          data: {
            postId: createdPost.id,
            question: poll.question,
            allowMultiple: poll.allowMultiple,
            expiresAt,
            options: {
              create: poll.options.map((opt, index) => ({
                text: opt,
                position: index
              }))
            }
          },
          include: {
            options: true
          }
        });

        createdPost.poll = createdPoll;
      }

      return createdPost;
    });

    if (isEmailBroadcast) {
      // await emailQueue.add('broadcast', { postId: post.id, groupId });
    }

    return post;
  }

  /**
   * Gets the feed
   * @param {string} groupId 
   * @param {string} userId 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getFeed(groupId, userId, { cursor, limit = 20, categoryId, search }) {
    const where = {
      groupId,
      deletedAt: null
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: decodeCursor(cursor) } : undefined,
      orderBy: [
        { isPinned: 'desc' },
        { pinnedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        poll: {
          include: {
            options: true
          }
        },
        likes: {
          where: { userId },
          take: 1
        },
        pollVotes: {
          where: { userId },
          select: { optionId: true }
        }
      }
    });

    let nextCursor = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = encodeCursor(nextItem.id);
    }

    const data = posts.map(post => {
      const { likes, pollVotes, ...rest } = post;
      return {
        ...rest,
        hasLiked: likes.length > 0,
        userVotedOptionIds: pollVotes ? pollVotes.map(v => v.optionId) : []
      };
    });

    return {
      data,
      meta: {
        nextCursor,
        limit
      }
    };
  }

  /**
   * Gets post by ID
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async getPostById(groupId, postId, userId) {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        groupId,
        deletedAt: null
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        poll: {
          include: {
            options: true
          }
        },
        likes: {
          where: { userId },
          take: 1
        },
        pollVotes: {
          where: { userId },
          select: { optionId: true }
        }
      }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    const { likes, pollVotes, ...rest } = post;
    return {
      ...rest,
      hasLiked: likes.length > 0,
      userVotedOptionIds: pollVotes ? pollVotes.map(v => v.optionId) : []
    };
  }

  /**
   * Updates a post
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} userId 
   * @param {string} userRole 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updatePost(groupId, postId, userId, userRole, data) {
    const post = await prisma.post.findFirst({
      where: { id: postId, groupId, deletedAt: null }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    if (post.authorId !== userId && userRole !== 'OWNER' && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this post');
    }

    if (data.categoryId && data.categoryId !== post.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, groupId }
      });
      if (!category) {
        throw new NotFoundError('Category not found or does not belong to this group');
      }
    }

    let updateData = { ...data };
    if (data.isPinned !== undefined && data.isPinned !== post.isPinned) {
      updateData.pinnedAt = data.isPinned ? new Date() : null;
    }

    return prisma.post.update({
      where: { id: postId },
      data: updateData
    });
  }

  /**
   * Deletes a post
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} userId 
   * @param {string} userRole 
   * @returns {Promise<void>}
   */
  async deletePost(groupId, postId, userId, userRole) {
    const post = await prisma.post.findFirst({
      where: { id: postId, groupId, deletedAt: null }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    if (post.authorId !== userId && !['OWNER', 'ADMIN', 'MODERATOR'].includes(userRole)) {
      throw new ForbiddenError('You do not have permission to delete this post');
    }

    await prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Toggles pin status
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async togglePin(groupId, postId, userId) {
    const post = await prisma.post.findFirst({
      where: { id: postId, groupId, deletedAt: null }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    const newIsPinned = !post.isPinned;
    const newPinnedAt = newIsPinned ? new Date() : null;

    return prisma.post.update({
      where: { id: postId },
      data: { isPinned: newIsPinned, pinnedAt: newPinnedAt }
    });
  }

  /**
   * Toggles like
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async toggleLike(groupId, postId, userId) {
    const post = await prisma.post.findFirst({
      where: { id: postId, groupId, deletedAt: null }
    });

    if (!post) {
      throw new NotFoundError('Post');
    }

    return prisma.$transaction(async (tx) => {
      const existingLike = await tx.postLike.findUnique({
        where: {
          postId_userId: { postId, userId }
        }
      });

      if (existingLike) {
        await tx.postLike.delete({
          where: {
            postId_userId: { postId, userId }
          }
        });
        const updatedPost = await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true }
        });
        return { liked: false, likeCount: updatedPost.likeCount };
      } else {
        await tx.postLike.create({
          data: { postId, userId }
        });
        const updatedPost = await tx.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true }
        });
        return { liked: true, likeCount: updatedPost.likeCount };
      }
    });
  }
}

export const postService = new PostService();
