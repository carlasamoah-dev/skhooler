/**
 * @fileoverview Circuit breaker wrapper for unreliable asynchronous functions.
 */
import CircuitBreaker from 'opossum';
import { logger } from './logger.js';

/**
 * Wraps a function in a circuit breaker.
 * @param {Function} fn - The asynchronous function to wrap.
 * @param {Object} [options={}] - Opossum configuration options.
 * @returns {CircuitBreaker} The configured circuit breaker instance.
 */
export function createCircuitBreaker(fn, options = {}) {
  const defaultOptions = {
    timeout: 10000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    volumeThreshold: 3,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const breaker = new CircuitBreaker(fn, mergedOptions);

  breaker.on('open', () => {
    logger.warn(`Circuit breaker opened for function ${fn.name || 'anonymous'}`);
  });

  breaker.on('halfOpen', () => {
    logger.info(`Circuit breaker half-opened for function ${fn.name || 'anonymous'}`);
  });

  breaker.on('close', () => {
    logger.info(`Circuit breaker closed for function ${fn.name || 'anonymous'}`);
  });

  return breaker;
}
