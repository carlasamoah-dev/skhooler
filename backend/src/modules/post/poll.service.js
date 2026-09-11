/**
 * @fileoverview Poll service
 */

import { prisma } from '../../config/database.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';

class PollService {
  /**
   * Vote on a poll
   * @param {string} groupId 
   * @param {string} postId 
   * @param {string} userId 
   * @param {Object} data
   * @param {Array<string>} data.optionIds
   * @returns {Promise<Object>}
   */
  async vote(groupId, postId, userId, { optionIds }) {
    const poll = await prisma.poll.findUnique({
      where: { postId },
      include: { options: true }
    });

    if (!poll) {
      throw new NotFoundError('Poll');
    }

    if (poll.expiresAt && poll.expiresAt < new Date()) {
      throw new BadRequestError('Poll has ended');
    }

    if (!poll.allowMultiple && optionIds.length > 1) {
      throw new BadRequestError('Only single choice allowed');
    }

    const validOptionIds = poll.options.map(o => o.id);
    const allValid = optionIds.every(id => validOptionIds.includes(id));
    if (!allValid) {
      throw new BadRequestError('Invalid option ID(s)');
    }

    await prisma.$transaction(async (tx) => {
      // Remove existing votes by this user for this poll
      const existingVotes = await tx.pollVote.findMany({
        where: { pollId: poll.id, userId }
      });

      if (existingVotes.length > 0) {
        await tx.pollVote.deleteMany({
          where: { pollId: poll.id, userId }
        });
        
        const oldOptionIds = existingVotes.map(v => v.optionId);
        await tx.pollOption.updateMany({
          where: { id: { in: oldOptionIds } },
          data: { voteCount: { decrement: 1 } }
        });
      }

      // Add new votes
      await tx.pollVote.createMany({
        data: optionIds.map(optionId => ({
          pollId: poll.id,
          userId,
          optionId
        }))
      });

      // Increment counts on new options
      await tx.pollOption.updateMany({
        where: { id: { in: optionIds } },
        data: { voteCount: { increment: 1 } }
      });

      // Recalculate total unique voters for this poll
      const uniqueVoters = await tx.pollVote.groupBy({
        by: ['userId'],
        where: { pollId: poll.id },
        _count: true
      });

      await tx.poll.update({
        where: { id: poll.id },
        data: { totalVotes: uniqueVoters.length }
      });
    });

    const result = await this.getPollResults(postId, userId);

    import('../../config/socket.js').then(({ getIO }) => {
      // Exclude userVotedOptionIds from broadcast so we don't mess up other clients' local state
      const { userVotedOptionIds, ...pollBroadcast } = result;
      getIO()?.to(`group:${groupId}`).emit('post:updated', {
        postId,
        patch: { poll: pollBroadcast }
      });
    }).catch(console.error);

    return result;
  }

  /**
   * Get poll results
   * @param {string} postId 
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async getPollResults(postId, userId) {
    const poll = await prisma.poll.findUnique({
      where: { postId },
      include: {
        options: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!poll) {
      throw new NotFoundError('Poll');
    }

    const userVotes = await prisma.pollVote.findMany({
      where: { pollId: poll.id, userId },
      select: { optionId: true }
    });

    const userVotedOptionIds = userVotes.map(v => v.optionId);

    const optionsWithPercentages = poll.options.map(option => {
      const percentage = poll.totalVotes > 0 
        ? Math.round((option.voteCount / poll.totalVotes) * 100) 
        : 0;
      
      return {
        ...option,
        percentage
      };
    });

    return {
      ...poll,
      options: optionsWithPercentages,
      userVotedOptionIds
    };
  }
}

export const pollService = new PollService();
