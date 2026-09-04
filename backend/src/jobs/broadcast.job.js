import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { emailQueue } from './queue.js';
import { logger } from '../utils/logger.js';

/**
 * Process a broadcast job to send emails to group members for a post
 * @param {import('bullmq').Job} job
 */
export async function processBroadcastJob(job) {
  const { postId } = job.data;

  if (!postId) {
    throw new Error('No postId provided for broadcast job');
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      group: true,
      author: true
    }
  });

  if (!post) {
    logger.error(`Broadcast job failed: Post ${postId} not found`);
    return;
  }

  const BATCH_SIZE = 50;
  let cursor = null;
  let hasMore = true;
  let totalProcessed = 0;

  const postUrl = `${env.CLIENT_URL}/${post.group.slug}/post/${post.id}`;
  const snippet = post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content;

  while (hasMore) {
    const members = await prisma.groupMember.findMany({
      where: { groupId: post.group.id },
      include: { user: true },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' }
    });

    if (members.length === 0) {
      hasMore = false;
      break;
    }

    const emailPromises = members.map(member => {
      if (!member.user.email) return Promise.resolve();

      return emailQueue.add('broadcast-email', {
        to: member.user.email,
        subject: `New Post in ${post.group.name}: ${post.title}`,
        html: `
          <div style="font-family: sans-serif;">
            <h2>${post.title}</h2>
            <p><strong>${post.author.firstName} ${post.author.lastName}</strong> posted in <strong>${post.group.name}</strong></p>
            <div style="padding: 10px; border-left: 3px solid #ccc; margin-bottom: 20px;">
              ${snippet}
            </div>
            <a href="${postUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Post</a>
          </div>
        `
      });
    });

    await Promise.all(emailPromises);
    
    totalProcessed += members.length;
    cursor = members[members.length - 1].id;
    
    if (members.length < BATCH_SIZE) {
      hasMore = false;
    }
  }

  // Update post broadcast Sent At
  await prisma.post.update({
    where: { id: postId },
    data: { broadcastSentAt: new Date() }
  });

  logger.info(`Broadcast completed for post ${postId}. Reached ${totalProcessed} members.`);
  return { success: true, totalProcessed };
}
