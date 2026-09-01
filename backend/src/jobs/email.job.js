import { resendClient } from '../config/resend.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { createCircuitBreaker } from '../utils/circuitBreaker.js';

/**
 * Process email jobs
 */

// Wrap Resend in circuit breaker
const sendEmailBreaker = createCircuitBreaker(
  async (emailData) => {
    return await resendClient.emails.send(emailData);
  },
  { timeout: 10000, errorThresholdPercentage: 50, resetTimeout: 30000 }
);

export async function processEmailJob(job) {
  const { type, to, data } = job.data;
  logger.info({ jobId: job.id, type, to }, 'Processing email job');

  let subject, html;

  switch (type) {
    case 'email-verification':
      subject = 'Verify your Skhooler account';
      html = buildVerificationEmail(data.firstName, data.verificationUrl);
      break;
    case 'password-reset':
      subject = 'Reset your Skhooler password';
      html = buildPasswordResetEmail(data.firstName, data.resetUrl);
      break;
    case 'welcome':
      subject = 'Welcome to Skhooler!';
      html = buildWelcomeEmail(data.firstName);
      break;
    default:
      throw new Error(`Unknown email type: ${type}`);
  }

  const result = await sendEmailBreaker.fire({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  logger.info({ jobId: job.id, type, messageId: result?.data?.id }, 'Email sent successfully');
  return result;
}

function buildVerificationEmail(firstName, verificationUrl) {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333;">Verify your email</h1>
    <p>Hi ${firstName},</p>
    <p>Thanks for signing up for Skhooler! Please verify your email by clicking the button below:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
    <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
    <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
  </div>`;
}

function buildPasswordResetEmail(firstName, resetUrl) {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333;">Reset your password</h1>
    <p>Hi ${firstName},</p>
    <p>We received a request to reset your password. Click the button below to set a new one:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
    <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
    <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}

function buildWelcomeEmail(firstName) {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333;">Welcome to Skhooler!</h1>
    <p>Hi ${firstName},</p>
    <p>We're thrilled to have you here.</p>
  </div>`;
}
