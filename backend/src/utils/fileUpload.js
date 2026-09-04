/**
 * File upload utility using Supabase Storage.
 */
import { supabaseAdmin } from '../config/supabase.js';
import { createCircuitBreaker } from './circuitBreaker.js';
import { logger } from './logger.js';
import crypto from 'crypto';

const uploadToSupabase = async ({ file, bucket, folder }) => {
  const uuid = crypto.randomUUID();
  const filePath = `${folder}/${uuid}-${file.originalname}`;
  
  const { data, error } = await supabaseAdmin
    .storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    logger.error({ err: error }, 'Supabase upload failed');
    throw error;
  }

  const { data: publicUrlData } = supabaseAdmin
    .storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

const uploadBreaker = createCircuitBreaker(uploadToSupabase, {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});

export const uploadFile = async ({ file, bucket, folder }) => {
  // If the circuit breaker object exposes .fire() natively:
  // We'll wrap in standard Promise structure assuming a robust implementation
  if (typeof uploadBreaker === 'function') {
    return await uploadBreaker({ file, bucket, folder });
  } else if (uploadBreaker && typeof uploadBreaker.fire === 'function') {
    return await uploadBreaker.fire({ file, bucket, folder });
  } else if (uploadBreaker && typeof uploadBreaker.execute === 'function') {
    return await uploadBreaker.execute({ file, bucket, folder });
  } else {
    // fallback if breaker interface is unknown
    return await uploadToSupabase({ file, bucket, folder });
  }
};

export const deleteFile = async (filePath, bucket) => {
  try {
    const { error } = await supabaseAdmin
      .storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      logger.error({ err: error }, 'Supabase file deletion failed');
      throw error;
    }
  } catch (err) {
    logger.error({ err }, 'Failed to delete file');
    throw err;
  }
};
