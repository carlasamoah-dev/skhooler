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
    case 'group-invite':
      subject = `You've been invited to join ${data.groupName} on Skhooler`;
      html = buildGroupInviteEmail(data.groupName, data.inviteUrl, data.inviterName);
      break;
    case 'join-approved':
      subject = `You're in! Your request to join ${data.groupName} was approved`;
      html = buildJoinApprovedEmail(data.firstName, data.groupName, data.groupSlug, data.welcomeMessage);
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

function buildGroupInviteEmail(groupName, inviteUrl, inviterName) {
  const from = inviterName ? `${inviterName} has` : 'You have been';
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333;">You're invited!</h1>
    <p>${from} invited you to join <strong>${groupName}</strong> on Skhooler.</p>
    <p>Click the button below to view the community and join:</p>
    <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Join ${groupName}</a>
    <p style="color: #666; font-size: 14px;">This invite link expires in 7 days. If you don't have an account yet, you'll be asked to create one first — it's free and only takes a minute.</p>
    <p style="color: #666; font-size: 14px;">If you weren't expecting this invite, you can safely ignore this email.</p>
  </div>`;
}

function buildJoinApprovedEmail(firstName, groupName, groupSlug, welcomeMessage) {
  const clientUrl = env.CLIENT_URL || 'https://skhooler.com';
  const communityUrl = `${clientUrl}/${groupSlug}/community`;
  const personalNote = welcomeMessage
    ? `<div style="background: #f5f5f5; border-left: 4px solid #4F46E5; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0;">
        <p style="margin: 0; font-style: italic; color: #444;">"${welcomeMessage}"</p>
      </div>`
    : '';
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333;">You're in, ${firstName}!</h1>
    <p>Great news — your request to join <strong>${groupName}</strong> has been approved.</p>
    ${personalNote}
    <p>Head over to the community to introduce yourself and get started:</p>
    <a href="${communityUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Go to ${groupName}</a>
    <p style="color: #666; font-size: 14px;">Welcome aboard!</p>
  </div>`;
}

