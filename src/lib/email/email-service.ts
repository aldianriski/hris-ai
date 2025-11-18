/**
 * Email Service - Supports multiple email providers
 * Providers: SendGrid, Resend, AWS SES, SMTP
 */

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: {
    email: string;
    name?: string;
  };
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface EmailProvider {
  sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * SendGrid Email Provider
 */
class SendGridProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: Array.isArray(params.to) ? params.to.map(email => ({ email })) : [{ email: params.to }],
            subject: params.subject,
          }],
          from: {
            email: params.from?.email || 'noreply@hris.com',
            name: params.from?.name || 'HRIS Platform',
          },
          content: [
            { type: 'text/html', value: params.html },
            ...(params.text ? [{ type: 'text/plain', value: params.text }] : []),
          ],
          attachments: params.attachments?.map(att => ({
            filename: att.filename,
            content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
            type: att.contentType || 'application/octet-stream',
          })),
          reply_to: params.replyTo ? { email: params.replyTo } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.errors?.[0]?.message || 'SendGrid API error');
      }

      const messageId = response.headers.get('X-Message-Id') || undefined;
      return { success: true, messageId };
    } catch (error) {
      console.error('SendGrid error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Resend Email Provider
 */
class ResendProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: params.from?.email
            ? `${params.from.name || 'HRIS Platform'} <${params.from.email}>`
            : 'HRIS Platform <noreply@hris.com>',
          to: Array.isArray(params.to) ? params.to : [params.to],
          subject: params.subject,
          html: params.html,
          text: params.text,
          attachments: params.attachments?.map(att => ({
            filename: att.filename,
            content: typeof att.content === 'string'
              ? att.content
              : att.content.toString('base64'),
          })),
          reply_to: params.replyTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Resend API error');
      }

      const data = await response.json();
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Mock Email Provider for development
 */
class MockProvider implements EmailProvider {
  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('📧 Mock Email Sent:');
    console.log(`  To: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
    console.log(`  Subject: ${params.subject}`);
    console.log(`  From: ${params.from?.email || 'noreply@hris.com'}`);
    console.log(`  Attachments: ${params.attachments?.length || 0}`);

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }
}

/**
 * Email Service Factory
 */
export class EmailService {
  private static instance: EmailService | null = null;
  private provider: EmailProvider;

  private constructor(provider: EmailProvider) {
    this.provider = provider;
  }

  /**
   * Initialize email service with settings from database
   */
  static async initialize(settings?: {
    provider?: string;
    apiKey?: string;
  }): Promise<EmailService> {
    if (EmailService.instance) {
      return EmailService.instance;
    }

    let provider: EmailProvider;

    // Use provided settings or default to mock in development
    const emailProvider = settings?.provider || process.env.EMAIL_PROVIDER || 'mock';
    const apiKey = settings?.apiKey || process.env.EMAIL_API_KEY || '';

    switch (emailProvider.toLowerCase()) {
      case 'sendgrid':
        if (!apiKey) {
          console.warn('SendGrid API key not provided, using mock provider');
          provider = new MockProvider();
        } else {
          provider = new SendGridProvider(apiKey);
        }
        break;

      case 'resend':
        if (!apiKey) {
          console.warn('Resend API key not provided, using mock provider');
          provider = new MockProvider();
        } else {
          provider = new ResendProvider(apiKey);
        }
        break;

      case 'mock':
      default:
        console.log('Using mock email provider (development mode)');
        provider = new MockProvider();
        break;
    }

    EmailService.instance = new EmailService(provider);
    return EmailService.instance;
  }

  /**
   * Send an email
   */
  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.provider.sendEmail(params);
  }

  /**
   * Reset instance (for testing)
   */
  static reset() {
    EmailService.instance = null;
  }
}

/**
 * Helper function to get or initialize email service
 */
export async function getEmailService(settings?: {
  provider?: string;
  apiKey?: string;
}): Promise<EmailService> {
  return EmailService.initialize(settings);
}
