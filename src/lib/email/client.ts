/**
 * Email Client
 * Handles sending emails via SendGrid or Resend
 */

import { EMAIL_CONFIG } from './config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Resend
 */
async function sendViaResend(options: EmailOptions): Promise<EmailResult> {
  try {
    if (!EMAIL_CONFIG.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMAIL_CONFIG.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo || EMAIL_CONFIG.REPLY_TO,
        attachments: options.attachments,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(options: EmailOptions): Promise<EmailResult> {
  try {
    if (!EMAIL_CONFIG.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMAIL_CONFIG.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(options.to)
              ? options.to.map(email => ({ email }))
              : [{ email: options.to }],
            subject: options.subject,
          },
        ],
        from: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.FROM_NAME,
        },
        reply_to: options.replyTo || EMAIL_CONFIG.REPLY_TO
          ? {
              email: options.replyTo || EMAIL_CONFIG.REPLY_TO,
            }
          : undefined,
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
          ...(options.text
            ? [
                {
                  type: 'text/plain',
                  value: options.text,
                },
              ]
            : []),
        ],
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content)
            ? att.content.toString('base64')
            : att.content,
          type: att.contentType || 'application/octet-stream',
          disposition: 'attachment',
        })),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.errors?.[0]?.message || 'Failed to send email');
    }

    const messageId = response.headers.get('x-message-id');

    return {
      success: true,
      messageId: messageId || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    // Validate email addresses
    const emails = Array.isArray(options.to) ? options.to : [options.to];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: `Invalid email address: ${email}`,
        };
      }
    }

    // Send via configured provider
    if (EMAIL_CONFIG.PROVIDER === 'sendgrid') {
      return await sendViaSendGrid(options);
    } else {
      return await sendViaResend(options);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send multiple emails in batch
 */
export async function sendBatchEmails(
  emails: EmailOptions[]
): Promise<EmailResult[]> {
  const results = await Promise.all(emails.map(email => sendEmail(email)));
  return results;
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(
  testEmail: string
): Promise<EmailResult> {
  return sendEmail({
    to: testEmail,
    subject: 'HRIS Email Configuration Test',
    html: '<p>Your email configuration is working correctly!</p>',
    text: 'Your email configuration is working correctly!',
  });
}
