/**
 * Integration service for managing webhooks and API keys
 */
import crypto from 'crypto'
import { prisma } from '../../config/database.js'
import { BadRequestError, NotFoundError } from '../../utils/errors.js'
import { webhookQueue } from '../../jobs/queue.js'

export const integrationService = {
  /**
   * Create a new webhook
   * @param {string} groupId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createWebhook(groupId, { url, events }) {
    const count = await prisma.webhookSubscription.count({
      where: { groupId }
    })
    
    if (count >= 10) {
      throw new BadRequestError('Maximum 10 webhooks allowed')
    }

    const secret = crypto.randomBytes(16).toString('hex')

    const webhook = await prisma.webhookSubscription.create({
      data: {
        groupId,
        url,
        events,
        secret
      }
    })

    return webhook
  },

  /**
   * Get all webhooks for a group
   * @param {string} groupId 
   * @returns {Promise<Array>}
   */
  async getWebhooks(groupId) {
    return prisma.webhookSubscription.findMany({
      where: { groupId },
      include: {
        _count: {
          select: { deliveries: true }
        }
      }
    })
  },

  /**
   * Update a webhook
   * @param {string} groupId 
   * @param {string} webhookId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateWebhook(groupId, webhookId, data) {
    return prisma.webhookSubscription.update({
      where: { id: webhookId, groupId },
      data
    })
  },

  /**
   * Delete a webhook
   * @param {string} groupId 
   * @param {string} webhookId 
   * @returns {Promise<void>}
   */
  async deleteWebhook(groupId, webhookId) {
    await prisma.webhookSubscription.delete({
      where: { id: webhookId, groupId }
    })
  },

  /**
   * Get deliveries for a webhook
   * @param {string} groupId 
   * @param {string} webhookId 
   * @param {Object} options 
   * @returns {Promise<Array>}
   */
  async getWebhookDeliveries(groupId, webhookId, { limit = 20 }) {
    // Verify webhook belongs to group
    const webhook = await prisma.webhookSubscription.findUnique({
      where: { id: webhookId, groupId }
    })
    
    if (!webhook) {
      throw new NotFoundError('Webhook not found')
    }

    return prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    })
  },

  /**
   * Test a webhook
   * @param {string} groupId 
   * @param {string} webhookId 
   * @returns {Promise<Object>}
   */
  async testWebhook(groupId, webhookId) {
    const webhook = await prisma.webhookSubscription.findUnique({
      where: { id: webhookId, groupId }
    })

    if (!webhook) {
      throw new NotFoundError('Webhook not found')
    }

    await webhookQueue.add('test.ping', {
      webhookId,
      event: 'test.ping',
      payload: { test: true, timestamp: new Date() }
    })

    return { message: 'Test webhook queued' }
  },

  /**
   * Create an API key
   * @param {string} groupId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createApiKey(groupId, { name }) {
    const count = await prisma.groupApiKey.count({
      where: { groupId }
    })

    if (count >= 5) {
      throw new BadRequestError('Maximum 5 API keys allowed')
    }

    const randomSecret = crypto.randomBytes(24).toString('hex')
    const fullKey = `sk_live_${randomSecret}`
    const keyPrefix = fullKey.substring(0, 12)
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex')

    const key = await prisma.groupApiKey.create({
      data: {
        groupId,
        name,
        keyPrefix,
        keyHash
      }
    })

    return {
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      apiKey: fullKey
    }
  },

  /**
   * Get all API keys for a group
   * @param {string} groupId 
   * @returns {Promise<Array>}
   */
  async getApiKeys(groupId) {
    const keys = await prisma.groupApiKey.findMany({
      where: { groupId }
    })
    
    // Omit keyHash
    return keys.map(({ keyHash, ...rest }) => rest)
  },

  /**
   * Delete an API key
   * @param {string} groupId 
   * @param {string} keyId 
   * @returns {Promise<void>}
   */
  async deleteApiKey(groupId, keyId) {
    await prisma.groupApiKey.delete({
      where: { id: keyId, groupId }
    })
  },

  /**
   * Dispatch a webhook event
   * @param {string} groupId 
   * @param {string} eventName 
   * @param {Object} payload 
   * @returns {Promise<void>}
   */
  async dispatchWebhookEvent(groupId, eventName, payload) {
    const webhooks = await prisma.webhookSubscription.findMany({
      where: {
        groupId,
        isActive: true,
        OR: [
          { events: { has: eventName } },
          { events: { has: '*' } }
        ]
      }
    })

    for (const wh of webhooks) {
      await webhookQueue.add(eventName, {
        webhookId: wh.id,
        event: eventName,
        payload
      })
    }
  }
}
