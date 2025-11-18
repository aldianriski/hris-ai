/**
 * Email Configuration
 * Supports both SendGrid and Resend
 */

export const EMAIL_CONFIG = {
  PROVIDER: process.env.EMAIL_PROVIDER || 'resend', // 'sendgrid' or 'resend'
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  FROM_EMAIL: process.env.EMAIL_FROM || 'noreply@hris.example.com',
  FROM_NAME: process.env.EMAIL_FROM_NAME || 'HRIS System',
  REPLY_TO: process.env.EMAIL_REPLY_TO,
} as const;

export const EMAIL_TEMPLATES = {
  LEAVE_SUBMITTED: 'leave-submitted',
  LEAVE_APPROVED: 'leave-approved',
  LEAVE_REJECTED: 'leave-rejected',
  PAYSLIP_READY: 'payslip-ready',
  PASSWORD_RESET: 'password-reset',
  WELCOME: 'welcome',
  DOCUMENT_VERIFIED: 'document-verified',
  PERFORMANCE_REVIEW_SUBMITTED: 'performance-review-submitted',
  MFA_ENABLED: 'mfa-enabled',
  EMPLOYEE_CREATED: 'employee-created',
} as const;

export const EMAIL_SUBJECTS = {
  [EMAIL_TEMPLATES.LEAVE_SUBMITTED]: 'Leave Request Submitted',
  [EMAIL_TEMPLATES.LEAVE_APPROVED]: 'Leave Request Approved',
  [EMAIL_TEMPLATES.LEAVE_REJECTED]: 'Leave Request Rejected',
  [EMAIL_TEMPLATES.PAYSLIP_READY]: 'Your Payslip is Ready',
  [EMAIL_TEMPLATES.PASSWORD_RESET]: 'Reset Your Password',
  [EMAIL_TEMPLATES.WELCOME]: 'Welcome to HRIS',
  [EMAIL_TEMPLATES.DOCUMENT_VERIFIED]: 'Document Verified',
  [EMAIL_TEMPLATES.PERFORMANCE_REVIEW_SUBMITTED]: 'Performance Review Submitted',
  [EMAIL_TEMPLATES.MFA_ENABLED]: 'Multi-Factor Authentication Enabled',
  [EMAIL_TEMPLATES.EMPLOYEE_CREATED]: 'Welcome to the Team',
} as const;
