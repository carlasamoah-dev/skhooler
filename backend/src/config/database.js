/**
 * @fileoverview Prisma client singleton initialization.
 */
import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const prismaClientSingleton = () => {
  const logLevels = env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'];
  return new PrismaClient({ log: logLevels });
};

const globalForPrisma = globalThis;

/**
 * Singleton instance of Prisma Client
 * @type {PrismaClient}
 */
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

prisma.$connect()
  .then(() => logger.info('Successfully connected to the database.'))
  .catch((err) => logger.error({ err }, 'Failed to connect to the database.'));
