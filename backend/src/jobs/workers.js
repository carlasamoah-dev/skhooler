import { Worker } from 'bullmq';
import { processEmailJob } from './email.job.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Start background workers
 */

const connectionUrl = new URL(env.REDIS_URL);
const redisConnection = {
  host: connectionUrl.hostname,
  port: parseInt(connectionUrl.port, 10),
  password: connectionUrl.password || undefined,
  tls: connectionUrl.protocol === 'rediss:' ? {} : undefined,
};

export function startWorkers() {
  const emailWorker = new Worker('email', processEmailJob, {
    connection: redisConnection,
    concurrency: 3, // max 3 concurrent email jobs
    limiter: { max: 10, duration: 1000 }, // max 10 jobs/second
  });

  emailWorker.on('completed', (job) => logger.info({ jobId: job.id }, 'Email job completed'));
  emailWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Email job failed'));

  logger.info('Background workers started');
}
