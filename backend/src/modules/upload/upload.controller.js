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

// Image-only buckets (5 MB limit)
const IMAGE_BUCKETS = ['community-icons', 'community-covers', 'avatars', 'course-covers']
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

// Lesson attachment bucket — accepts virtually all document/media types (500 MB limit)
const ATTACHMENT_BUCKETS = ['lesson-attachments']
const ATTACHMENT_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.oasis.opendocument.text',   // .odt
  'application/vnd.oasis.opendocument.spreadsheet', // .ods
  // Video
  'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska',
  // Audio
  'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm',
  // Archives
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
  // Text / Code
  'text/plain', 'text/csv', 'text/html', 'application/json',
  // Misc
  'application/octet-stream', // catch-all for binary files
]

const IMAGE_MAX_BYTES  = 5   * 1024 * 1024   // 5 MB
const ATTACH_MAX_BYTES = 500 * 1024 * 1024   // 500 MB

const ALL_BUCKETS = [...IMAGE_BUCKETS, ...ATTACHMENT_BUCKETS]

/**
 * POST /api/upload/signed-url
 * Returns a Supabase signed upload URL so the client can PUT the file directly.
 */
export async function getSignedUrl(req, res, next) {
  try {
    const { bucket, filename, contentType, size } = req.body

    if (!ALL_BUCKETS.includes(bucket)) {
      throw new BadRequestError(`Invalid bucket. Allowed buckets: ${ALL_BUCKETS.join(', ')}`)
    }

    const isImageBucket      = IMAGE_BUCKETS.includes(bucket)
    const isAttachmentBucket = ATTACHMENT_BUCKETS.includes(bucket)

    if (isImageBucket && !IMAGE_TYPES.includes(contentType)) {
      throw new BadRequestError('Image bucket only accepts JPEG, PNG, WebP, GIF, or SVG files.')
    }

    if (isAttachmentBucket && !ATTACHMENT_TYPES.includes(contentType)) {
      throw new BadRequestError(`File type "${contentType}" is not allowed for lesson attachments.`)
    }

    // Size gate (size is optional — Supabase also enforces bucket-level limits)
    if (size) {
      const maxBytes = isImageBucket ? IMAGE_MAX_BYTES : ATTACH_MAX_BYTES
      if (Number(size) > maxBytes) {
        const limit = isImageBucket ? '5 MB' : '500 MB'
        throw new BadRequestError(`File is too large. Maximum size for this bucket is ${limit}.`)
      }
    }

    // Generate a unique, safe storage path per user
    const ext        = path.extname(filename) || ''
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

