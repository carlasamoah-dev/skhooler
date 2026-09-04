import { Worker } from 'bullmq';
import { processEmailJob } from './email.job.js';
import { processBroadcastJob } from './broadcast.job.js';
import { processWebhookJob } from './webhook.job.js';
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

  const broadcastWorker = new Worker('broadcast', processBroadcastJob, {
    connection: redisConnection,
    concurrency: 1, // processes one broadcast at a time
  });

  broadcastWorker.on('completed', (job) => logger.info({ jobId: job.id }, 'Broadcast job completed'));
  broadcastWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Broadcast job failed'));

  const webhookWorker = new Worker('webhook', processWebhookJob, {
    connection: redisConnection,
    concurrency: 5,
  });

  webhookWorker.on('completed', (job) => logger.info({ jobId: job.id }, 'Webhook job completed'));
  webhookWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Webhook job failed'));

  logger.info('Background workers started');
}
