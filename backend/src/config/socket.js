/**
 * @fileoverview Socket.io server configuration and setup.
 */
import { Server } from 'socket.io';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { redis } from './redis.js';

/**
 * Setup Socket.io on the provided HTTP server.
 * @param {import('http').Server} httpServer - The HTTP server instance.
 * @returns {Server} The Socket.io server instance.
 */
export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication token missing'));
      }
      const decoded = verifyAccessToken(token);
      socket.user = { id: decoded.sub };
      next();
    } catch (error) {
      next(new Error('Invalid or expired authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info({ userId, socketId: socket.id }, 'User connected via Socket.io');
    
    // Add user to online_users set
    redis.sadd('online_users', userId).catch(err => {
      logger.error({ err, userId }, 'Failed to add user to online_users');
    });

    // In-memory rate limiting: disconnect if > 30 events/minute
    let eventCount = 0;
    const rateLimitInterval = setInterval(() => {
      eventCount = 0;
    }, 60000);

    socket.use((packet, next) => {
      eventCount++;
      if (eventCount > 30) {
        logger.warn({ userId, socketId: socket.id }, 'Socket rate limit exceeded. Disconnecting.');
        socket.disconnect(true);
        return next(new Error('Rate limit exceeded'));
      }
      next();
    });

    socket.on('disconnect', () => {
      clearInterval(rateLimitInterval);
      logger.info({ userId, socketId: socket.id }, 'User disconnected via Socket.io');
      redis.srem('online_users', userId).catch(err => {
        logger.error({ err, userId }, 'Failed to remove user from online_users');
      });
    });
  });

  return io;
}
