import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validateRequest.js'
import { z } from 'zod'
import { getSignedUrl } from './upload.controller.js'

const router = Router()

const signedUrlSchema = z.object({
  bucket: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
})

router.post('/signed-url', authenticate, validateBody(signedUrlSchema), getSignedUrl)

export default router
