/**
 * @fileoverview Real-time emission helper functions.
 */
import { getIO } from '../config/socket.js';

/**
 * Emit an event with data to a specific user via their personal room.
 * @param {string} userId - The target user's ID.
 * @param {string} event - The name of the event to emit.
 * @param {any} data - The payload to send with the event.
 */
export function emitToUser(userId, event, data) {
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit an event with data to a specific group room.
 * @param {string} groupId - The target group's ID.
 * @param {string} event - The name of the event to emit.
 * @param {any} data - The payload to send with the event.
 */
export function emitToGroup(groupId, event, data) {
  const io = getIO();
  if (io) {
    io.to(`group:${groupId}`).emit(event, data);
  }
}
