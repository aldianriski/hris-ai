/**
 * Email Sending Job
 * Handles async email delivery with retries
 */

import { inngest } from '@/lib/queue/client';
import { sendEmail } from '@/lib/email/client';
import {
  sendLeaveApprovedEmail,
  sendLeaveRejectedEmail,
  sendLeaveSubmittedEmail,
  sendPayslipReadyEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '@/lib/email/sender';

/**
 * Send email job with automatic retries
 */
export const sendEmailJob = inngest.createFunction(
  {
    id: 'send-email',
    name: 'Send Email',
    retries: 3,
    // Retry with exponential backoff
    onFailure: async ({ error, event }) => {
      console.error('Email sending failed after retries:', {
        error: error.message,
        event: event.data,
      });

      // TODO: Store failed email in dead letter queue
      // Could send to a monitoring service like Sentry here
    },
  },
  { event: 'email/send' },
  async ({ event, step }) => {
    const { type, to, subject, data } = event.data;

    const result = await step.run('send-email', async () => {
      // Route to appropriate email sender based on type
      switch (type) {
        case 'leave-approved':
          return await sendLeaveApprovedEmail(to as string, data);

        case 'leave-rejected':
          return await sendLeaveRejectedEmail(to as string, data);

        case 'leave-submitted':
          return await sendLeaveSubmittedEmail(to as string, data);

        case 'payslip-ready':
          return await sendPayslipReadyEmail(to as string, data);

        case 'welcome':
          return await sendWelcomeEmail(to as string, data);

        case 'password-reset':
          return await sendPasswordResetEmail(to as string, data);

        case 'payroll-processed':
          // Generic email for payroll processing completion
          return await sendEmail({
            to: to as string,
            subject: subject || 'Payroll Processing Complete',
            html: `
              <h2>Payroll Processing Complete</h2>
              <p>The payroll for period ${data.period} has been processed.</p>
              <ul>
                <li>Total Employees: ${data.totalEmployees}</li>
                <li>Successful: ${data.successCount}</li>
                <li>Failed: ${data.failedCount}</li>
              </ul>
            `,
            text: `Payroll Processing Complete\n\nThe payroll for period ${data.period} has been processed.\n\nTotal Employees: ${data.totalEmployees}\nSuccessful: ${data.successCount}\nFailed: ${data.failedCount}`,
          });

        default:
          // Generic email sending
          if (!subject) {
            throw new Error('Subject is required for generic email');
          }

          return await sendEmail({
            to: Array.isArray(to) ? to : [to],
            subject,
            html: data.html || JSON.stringify(data),
            text: data.text || JSON.stringify(data),
          });
      }
    });

    if (!result.success) {
      throw new Error(`Email sending failed: ${result.error}`);
    }

    return {
      success: true,
      messageId: result.messageId,
      type,
      to,
    };
  }
);

/**
 * Send batch emails job
 * Useful for sending notifications to multiple employees
 */
export const sendBatchEmailsJob = inngest.createFunction(
  {
    id: 'send-batch-emails',
    name: 'Send Batch Emails',
    concurrency: [
      {
        limit: 10, // Send max 10 emails concurrently
      },
    ],
  },
  { event: 'email/send-batch' },
  async ({ event, step }) => {
    const { emails } = event.data as { emails: Array<{ to: string; type: string; data: any }> };

    const results = await step.run('send-all-emails', async () => {
      const batchResults = await Promise.allSettled(
        emails.map(async (email) => {
          const result = await sendEmail({
            to: email.to,
            subject: email.data.subject || 'HRIS Notification',
            html: email.data.html || '',
            text: email.data.text || '',
          });

          if (!result.success) {
            throw new Error(result.error || 'Failed to send email');
          }

          return result;
        })
      );

      return batchResults.map((result, index) => ({
        to: emails[index].to,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason.message : undefined,
      }));
    });

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      total: emails.length,
      successCount,
      failedCount,
      results,
    };
  }
);
