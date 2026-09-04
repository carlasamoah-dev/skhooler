import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Process a webhook delivery job
 * @param {import('bullmq').Job} job
 */
export async function processWebhookJob(job) {
  const { webhookId, event, payload } = job.data;

  try {
    const webhook = await prisma.webhookSubscription.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      logger.info(`Webhook ${webhookId} not found or inactive, skipping`);
      return;
    }

    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(payloadString)
      .digest('hex');

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 5000);
    const signal = abortController.signal;

    const startTime = Date.now();
    let res;
    let error;

    try {
      res = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Skhooler-Signature': signature,
          'X-Skhooler-Event': event,
          'User-Agent': 'Skhooler-Webhooks/1.0',
        },
        body: payloadString,
        signal,
      });
    } catch (e) {
      error = e;
    } finally {
      clearTimeout(timeoutId);
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    let responseStatus = null;
    let responseBody = null;
    let isSuccess = false;

    if (res) {
      responseStatus = res.status;
      isSuccess = res.ok;
      try {
        const text = await res.text();
        responseBody = text ? text.substring(0, 2000) : null;
      } catch (e) {
        responseBody = 'Could not read response body';
      }
    } else if (error) {
      responseBody = error.message ? error.message.substring(0, 2000) : 'Unknown error';
    }

    await prisma.webhookDelivery.create({
      data: {
        webhookId,
        event,
        payload,
        responseStatus,
        responseBody,
        durationMs,
        isSuccess,
      },
    });

    if (!isSuccess) {
      const newFailureCount = webhook.failureCount + 1;
      await prisma.webhookSubscription.update({
        where: { id: webhookId },
        data: {
          failureCount: newFailureCount,
          isActive: newFailureCount >= 10 ? false : true,
        },
      });
      throw new Error(`Webhook delivery failed with status ${responseStatus || 'network error'}`);
    } else {
      if (webhook.failureCount > 0) {
        await prisma.webhookSubscription.update({
          where: { id: webhookId },
          data: { failureCount: 0 },
        });
      }
    }
  } catch (error) {
    logger.error(`Webhook job ${job.id} failed:`, error);
    throw error;
  }
}
