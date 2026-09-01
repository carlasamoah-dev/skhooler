/**
 * @fileoverview Resend email client configuration.
 */
import { Resend } from 'resend';
import { env } from './env.js';

/**
 * Singleton Resend client.
 * @type {Resend}
 */
export const resendClient = new Resend(env.RESEND_API_KEY);
