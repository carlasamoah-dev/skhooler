/**
 * @fileoverview Upload controller - generates Supabase Storage signed upload URLs
 */

import { createClient } from '@supabase/supabase-js'
import { env } from '../../config/env.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import { BadRequestError } from '../../utils/errors.js'
import crypto from 'crypto'
import path from 'path'

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

const ALLOWED_BUCKETS = ['community-icons', 'community-covers', 'avatars']
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

/**
 * POST /api/upload/signed-url
 * Returns a Supabase signed upload URL so the client can PUT the file directly.
 */
export async function getSignedUrl(req, res, next) {
  try {
    const { bucket, filename, contentType } = req.body

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      throw new BadRequestError(`Invalid bucket. Must be one of: ${ALLOWED_BUCKETS.join(', ')}`)
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new BadRequestError('Invalid file type. Allowed: JPEG, PNG, WebP, GIF')
    }

    // Generate a unique, safe storage path per user
    const ext = path.extname(filename) || '.jpg'
    const uniqueName = `${req.user.id}/${crypto.randomUUID()}${ext}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(uniqueName)

    if (error) {
      throw new Error(`Supabase storage error: ${error.message}`)
    }

    // Build the public URL that will be accessible after upload
    const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${uniqueName}`

    sendSuccess(res, {
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl,
    })
  } catch (error) {
    next(error)
  }
}
