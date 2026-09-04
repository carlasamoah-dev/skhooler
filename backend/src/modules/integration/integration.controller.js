/**
 * Integration controller for handling webhooks and API keys routes
 */
import { integrationService } from './integration.service.js'
import { sendSuccess } from '../../utils/apiResponse.js'

/**
 * Create a new webhook
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function createWebhook(req, res, next) {
  try {
    const webhook = await integrationService.createWebhook(req.group.id, req.body)
    return sendSuccess(res, webhook, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all webhooks
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getWebhooks(req, res, next) {
  try {
    const webhooks = await integrationService.getWebhooks(req.group.id)
    return sendSuccess(res, webhooks, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Update a webhook
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function updateWebhook(req, res, next) {
  try {
    const webhook = await integrationService.updateWebhook(req.group.id, req.params.webhookId, req.body)
    return sendSuccess(res, webhook, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a webhook
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function deleteWebhook(req, res, next) {
  try {
    await integrationService.deleteWebhook(req.group.id, req.params.webhookId)
    return sendSuccess(res, null, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Get deliveries for a webhook
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getWebhookDeliveries(req, res, next) {
  try {
    const deliveries = await integrationService.getWebhookDeliveries(req.group.id, req.params.webhookId, req.query)
    return sendSuccess(res, deliveries, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Test a webhook
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function testWebhook(req, res, next) {
  try {
    const result = await integrationService.testWebhook(req.group.id, req.params.webhookId)
    return sendSuccess(res, result, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Create an API key
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function createApiKey(req, res, next) {
  try {
    const key = await integrationService.createApiKey(req.group.id, req.body)
    return sendSuccess(res, key, 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get API keys
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function getApiKeys(req, res, next) {
  try {
    const keys = await integrationService.getApiKeys(req.group.id)
    return sendSuccess(res, keys, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete an API key
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export async function deleteApiKey(req, res, next) {
  try {
    await integrationService.deleteApiKey(req.group.id, req.params.keyId)
    return sendSuccess(res, null, 200)
  } catch (error) {
    next(error)
  }
}
