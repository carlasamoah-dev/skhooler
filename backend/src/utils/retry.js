/**
 * @fileoverview Utility to retry asynchronous operations with exponential backoff and jitter.
 */
import { logger } from './logger.js';

/**
 * Execute an asynchronous function with retries on failure.
 * @param {Function} fn - The async function to execute.
 * @param {Object} [options={}] - Retry options.
 * @param {number} [options.maxRetries=3] - Maximum number of retries.
 * @param {number} [options.baseDelay=1000] - Base delay in milliseconds.
 * @param {number} [options.maxDelay=10000] - Maximum delay between retries.
 * @param {Function} [options.shouldRetry=() => true] - Function to determine if an error should trigger a retry.
 * @returns {Promise<any>} The result of the function if successful.
 * @throws {Error} The last error thrown if all retries are exhausted.
 */
export async function withRetry(fn, { 
  maxRetries = 3, 
  baseDelay = 1000, 
  maxDelay = 10000, 
  shouldRetry = () => true 
} = {}) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      attempt++;
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay) + Math.random() * 1000;
      
      logger.warn(
        { err: error, attempt, nextRetryDelay: delay }, 
        `Operation failed, retrying in ${Math.round(delay)}ms (attempt ${attempt} of ${maxRetries})`
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
