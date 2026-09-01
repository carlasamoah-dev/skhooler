/**
 * @fileoverview Logger utility using Pino.
 */
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';

const isDev = env.NODE_ENV === 'development';

/**
 * Singleton Pino logger instance.
 */
export const logger = pino({
  level: isDev ? 'debug' : 'info',
  base: { service: 'skhooler-api' },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});

/**
 * Create a child logger with a unique request ID.
 * @returns {pino.Logger}
 */
export function createRequestLogger() {
  return logger.child({ requestId: uuidv4() });
}
