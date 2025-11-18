/**
 * Base Email Template
 * Provides consistent layout for all emails
 */

export interface BaseEmailProps {
  title: string;
  preheader?: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
  footerText?: string;
}

export function baseEmailTemplate(props: BaseEmailProps): string {
  const { title, preheader, content, actionUrl, actionText, footerText } = props;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333333;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
    }
    .email-body {
      padding: 40px 20px;
    }
    .email-content {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
    }
    .email-button {
      display: inline-block;
      padding: 14px 32px;
      margin: 24px 0;
      background-color: #667eea;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }
    .email-button:hover {
      background-color: #5568d3;
    }
    .email-footer {
      padding: 20px;
      text-align: center;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .divider {
      border: 0;
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
    @media only screen and (max-width: 600px) {
      .email-body {
        padding: 20px 15px;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  <div class="email-wrapper">
    <div class="email-header">
      <h1>🏢 ${title}</h1>
    </div>
    <div class="email-body">
      <div class="email-content">
        ${content}
      </div>
      ${actionUrl && actionText ? `
        <div style="text-align: center; margin-top: 32px;">
          <a href="${actionUrl}" class="email-button">${actionText}</a>
        </div>
      ` : ''}
    </div>
    <div class="email-footer">
      <p>${footerText || 'This is an automated message from your HRIS system. Please do not reply to this email.'}</p>
      <p style="margin-top: 16px; font-size: 12px;">
        © ${new Date().getFullYear()} HRIS System. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version from HTML content
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}
