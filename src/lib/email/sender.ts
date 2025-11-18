/**
 * Email Sender
 * High-level functions for sending emails
 */

import { sendEmail, EmailResult } from './client';
import { EMAIL_SUBJECTS } from './config';
import {
  leaveSubmittedEmail,
  leaveApprovedEmail,
  leaveRejectedEmail,
  type LeaveSubmittedEmailData,
  type LeaveApprovedEmailData,
  type LeaveRejectedEmailData,
} from './templates/leave';
import {
  payslipReadyEmail,
  type PayslipReadyEmailData,
} from './templates/payroll';
import {
  welcomeEmail,
  passwordResetEmail,
  mfaEnabledEmail,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type MFAEnabledEmailData,
} from './templates/auth';

/**
 * Send leave submitted notification
 */
export async function sendLeaveSubmittedEmail(
  to: string,
  data: LeaveSubmittedEmailData
): Promise<EmailResult> {
  const { html, text } = leaveSubmittedEmail(data);

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS['leave-submitted'],
    html,
    text,
  });
}

/**
 * Send leave approved notification
 */
export async function sendLeaveApprovedEmail(
  to: string,
  data: LeaveApprovedEmailData
): Promise<EmailResult> {
  const { html, text } = leaveApprovedEmail(data);

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS['leave-approved'],
    html,
    text,
  });
}

/**
 * Send leave rejected notification
 */
export async function sendLeaveRejectedEmail(
  to: string,
  data: LeaveRejectedEmailData
): Promise<EmailResult> {
  const { html, text } = leaveRejectedEmail(data);

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS['leave-rejected'],
    html,
    text,
  });
}

/**
 * Send payslip ready notification
 */
export async function sendPayslipReadyEmail(
  to: string,
  data: PayslipReadyEmailData
): Promise<EmailResult> {
  const { html, text } = payslipReadyEmail(data);

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS['payslip-ready'],
    html,
    text,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<EmailResult> {
  const { html, text } = welcomeEmail(data);

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS['welcome'],
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  data: PasswordResetEmailData
): Promise<EmailResult> {
  const { html, text } = passwordResetEmail(data);

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS['password-reset'],
    html,
    text,
  });
}

/**
 * Send MFA enabled notification
 */
export async function sendMFAEnabledEmail(
  to: string,
  data: MFAEnabledEmailData
): Promise<EmailResult> {
  const { html, text } = mfaEnabledEmail(data);

  return sendEmail({
    to,
    subject: EMAIL_SUBJECTS['mfa-enabled'],
    html,
    text,
  });
}

/**
 * Queue email for async sending
 * TODO: Integrate with job queue system (P1.2)
 */
export async function queueEmail(
  type: string,
  to: string,
  data: any
): Promise<{ queued: boolean; error?: string }> {
  try {
    // For now, send immediately
    // This will be replaced with actual queue in P1.2
    let result: EmailResult;

    switch (type) {
      case 'leave-submitted':
        result = await sendLeaveSubmittedEmail(to, data);
        break;
      case 'leave-approved':
        result = await sendLeaveApprovedEmail(to, data);
        break;
      case 'leave-rejected':
        result = await sendLeaveRejectedEmail(to, data);
        break;
      case 'payslip-ready':
        result = await sendPayslipReadyEmail(to, data);
        break;
      case 'welcome':
        result = await sendWelcomeEmail(to, data);
        break;
      case 'password-reset':
        result = await sendPasswordResetEmail(to, data);
        break;
      case 'mfa-enabled':
        result = await sendMFAEnabledEmail(to, data);
        break;
      default:
        return { queued: false, error: 'Unknown email type' };
    }

    return { queued: result.success, error: result.error };
  } catch (error) {
    return {
      queued: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
