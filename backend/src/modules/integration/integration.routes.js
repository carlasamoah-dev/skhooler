/**
 * Routes for integration (webhooks, API keys)
 */
import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { loadGroup, requireOwner } from '../../middleware/authorize.js'
import { validateBody } from '../../middleware/validateRequest.js'
import { createWebhookSchema, updateWebhookSchema, createApiKeySchema } from './integration.schema.js'
import * as integrationController from './integration.controller.js'

const router = Router({ mergeParams: true })

router.use(authenticate, loadGroup, requireOwner)

// Webhooks
router.post('/webhooks', validateBody(createWebhookSchema), integrationController.createWebhook)
router.get('/webhooks', integrationController.getWebhooks)
router.patch('/webhooks/:webhookId', validateBody(updateWebhookSchema), integrationController.updateWebhook)
router.delete('/webhooks/:webhookId', integrationController.deleteWebhook)
router.get('/webhooks/:webhookId/deliveries', integrationController.getWebhookDeliveries)
router.post('/webhooks/:webhookId/test', integrationController.testWebhook)

// API Keys
router.post('/keys', validateBody(createApiKeySchema), integrationController.createApiKey)
router.get('/keys', integrationController.getApiKeys)
router.delete('/keys/:keyId', integrationController.deleteApiKey)

export default router
