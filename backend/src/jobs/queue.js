import { Queue } from 'bullmq';
import { env } from '../config/env.js';

/**
 * Background job queues configuration
 */

const connectionUrl = new URL(env.REDIS_URL);
const redisConnection = {
  host: connectionUrl.hostname,
  port: parseInt(connectionUrl.port, 10),
  password: connectionUrl.password || undefined,
  tls: connectionUrl.protocol === 'rediss:' ? {} : undefined,
};

export const emailQueue = new Queue('email', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export const maintenanceQueue = new Queue('maintenance', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { count: 50 },
  },
});
