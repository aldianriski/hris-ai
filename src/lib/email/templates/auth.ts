/**
 * Authentication Email Templates
 */

import { baseEmailTemplate, htmlToPlainText } from './base';

export interface WelcomeEmailData {
  employeeName: string;
  companyName: string;
  loginUrl: string;
  tempPassword?: string;
}

export function welcomeEmail(data: WelcomeEmailData): { html: string; text: string } {
  const content = `
    <p>Hello ${data.employeeName},</p>
    <p>Welcome to <strong>${data.companyName}</strong>! We're excited to have you on the team.</p>
    <p>Your employee account has been created and you can now access the HRIS system.</p>
    ${
      data.tempPassword
        ? `
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 24px 0;">
      <p style="margin: 0;"><strong>Temporary Password:</strong></p>
      <p style="margin: 8px 0; font-family: monospace; font-size: 18px; font-weight: 600;">${data.tempPassword}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #92400e;">
        ⚠️ Please change this password immediately after your first login.
      </p>
    </div>
    `
        : ''
    }
    <p>Through the HRIS portal, you can:</p>
    <ul style="color: #6b7280; line-height: 1.8;">
      <li>View and request leave</li>
      <li>Check your attendance</li>
      <li>Download payslips</li>
      <li>Update your profile</li>
      <li>View company documents</li>
    </ul>
    <p>If you have any questions, please don't hesitate to reach out to HR.</p>
  `;

  const html = baseEmailTemplate({
    title: 'Welcome to HRIS',
    preheader: `Welcome to ${data.companyName}`,
    content,
    actionUrl: data.loginUrl,
    actionText: 'Login to HRIS',
  });

  return {
    html,
    text: htmlToPlainText(html),
  };
}

export interface PasswordResetEmailData {
  employeeName: string;
  resetUrl: string;
  expiresIn: string;
}

export function passwordResetEmail(data: PasswordResetEmailData): { html: string; text: string } {
  const content = `
    <p>Hello ${data.employeeName},</p>
    <p>We received a request to reset your password. Click the button below to create a new password.</p>
    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        ⚠️ This link will expire in <strong>${data.expiresIn}</strong>.
      </p>
    </div>
    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      For security reasons, never share your password with anyone.
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'Reset Your Password',
    preheader: 'Reset your HRIS password',
    content,
    actionUrl: data.resetUrl,
    actionText: 'Reset Password',
  });

  return {
    html,
    text: htmlToPlainText(html),
  };
}

export interface MFAEnabledEmailData {
  employeeName: string;
  enabledAt: string;
  dashboardUrl: string;
}

export function mfaEnabledEmail(data: MFAEnabledEmailData): { html: string; text: string } {
  const content = `
    <p>Hello ${data.employeeName},</p>
    <p>Multi-Factor Authentication (MFA) has been <strong style="color: #10b981;">enabled</strong> on your account.</p>
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 24px 0;">
      <p style="margin: 8px 0;"><strong>Enabled At:</strong> ${data.enabledAt}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #065f46;">
        ✓ Your account security has been enhanced with MFA.
      </p>
    </div>
    <p>From now on, you'll need to provide a verification code when logging in.</p>
    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      If you didn't enable MFA, please contact support immediately.
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'MFA Enabled',
    preheader: 'Two-factor authentication has been enabled',
    content,
    actionUrl: data.dashboardUrl,
    actionText: 'Go to Dashboard',
  });

  return {
    html,
    text: htmlToPlainText(html),
  };
}
