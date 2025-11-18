-- Migration: Create email_templates table
-- Created: 2025-11-18
-- Description: Stores customizable email templates for platform-wide communication

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template Identification
  key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'welcome_email', 'invoice_sent', 'password_reset'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'transactional', -- transactional, marketing, billing

  -- Email Content
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  plain_text_content TEXT,

  -- Metadata
  variables JSONB DEFAULT '[]'::JSONB, -- Array of available variables: ["{{userName}}", "{{companyName}}"]
  preview_data JSONB DEFAULT '{}'::JSONB, -- Sample data for preview

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_system_template BOOLEAN DEFAULT false, -- System templates cannot be deleted

  -- Versioning
  version INTEGER DEFAULT 1,
  last_modified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_templates_key ON public.email_templates(key);
CREATE INDEX idx_email_templates_category ON public.email_templates(category);
CREATE INDEX idx_email_templates_is_active ON public.email_templates(is_active);

-- Updated at trigger
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.email_templates IS 'Customizable email templates for platform-wide communication';
COMMENT ON COLUMN public.email_templates.key IS 'Unique identifier for the template (e.g., welcome_email)';
COMMENT ON COLUMN public.email_templates.variables IS 'Array of available template variables for replacement';
COMMENT ON COLUMN public.email_templates.is_system_template IS 'System templates cannot be deleted, only modified';

-- Seed default email templates
INSERT INTO public.email_templates (key, name, description, category, subject, html_content, plain_text_content, variables, preview_data, is_system_template) VALUES

-- Welcome Email
('welcome_email', 'Welcome Email', 'Sent to new users when they join a tenant', 'transactional',
 'Welcome to {{companyName}} - Get Started!',
 '<h1>Welcome to {{companyName}}!</h1><p>Hi {{userName}},</p><p>We''re excited to have you on board. Your account has been created and you can now access the HRIS platform.</p><p><strong>Get started:</strong></p><ul><li>Complete your profile</li><li>Explore the dashboard</li><li>Connect with your team</li></ul><p>If you have any questions, feel free to reach out to our support team.</p><p>Best regards,<br>{{companyName}} Team</p>',
 'Welcome to {{companyName}}!\n\nHi {{userName}},\n\nWe''re excited to have you on board. Your account has been created and you can now access the HRIS platform.\n\nGet started:\n- Complete your profile\n- Explore the dashboard\n- Connect with your team\n\nIf you have any questions, feel free to reach out to our support team.\n\nBest regards,\n{{companyName}} Team',
 '["{{userName}}", "{{companyName}}", "{{userEmail}}", "{{loginUrl}}"]'::JSONB,
 '{"userName": "John Doe", "companyName": "ACME Corp", "userEmail": "john@acme.com", "loginUrl": "https://app.hris.com/login"}'::JSONB,
 true),

-- Password Reset
('password_reset', 'Password Reset', 'Sent when a user requests a password reset', 'transactional',
 'Reset Your Password - {{companyName}}',
 '<h1>Password Reset Request</h1><p>Hi {{userName}},</p><p>We received a request to reset your password for your {{companyName}} account.</p><p><a href="{{resetUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p><p>If you didn''t request this, you can safely ignore this email.</p><p>This link will expire in 24 hours.</p>',
 'Password Reset Request\n\nHi {{userName}},\n\nWe received a request to reset your password for your {{companyName}} account.\n\nReset your password: {{resetUrl}}\n\nIf you didn''t request this, you can safely ignore this email.\n\nThis link will expire in 24 hours.',
 '["{{userName}}", "{{companyName}}", "{{resetUrl}}"]'::JSONB,
 '{"userName": "John Doe", "companyName": "ACME Corp", "resetUrl": "https://app.hris.com/reset-password?token=abc123"}'::JSONB,
 true),

-- Invoice Sent
('invoice_sent', 'Invoice Sent', 'Sent when an invoice is generated and sent to customer', 'billing',
 'Invoice {{invoiceNumber}} from {{companyName}}',
 '<h1>Invoice {{invoiceNumber}}</h1><p>Dear {{customerName}},</p><p>Thank you for your business! Please find your invoice details below.</p><p><strong>Invoice Number:</strong> {{invoiceNumber}}<br><strong>Amount Due:</strong> {{amountDue}}<br><strong>Due Date:</strong> {{dueDate}}</p><p><a href="{{invoiceUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Invoice</a></p>',
 'Invoice {{invoiceNumber}}\n\nDear {{customerName}},\n\nThank you for your business! Please find your invoice details below.\n\nInvoice Number: {{invoiceNumber}}\nAmount Due: {{amountDue}}\nDue Date: {{dueDate}}\n\nView invoice: {{invoiceUrl}}',
 '["{{customerName}}", "{{companyName}}", "{{invoiceNumber}}", "{{amountDue}}", "{{dueDate}}", "{{invoiceUrl}}"]'::JSONB,
 '{"customerName": "ACME Corp", "companyName": "HRIS Platform", "invoiceNumber": "INV-2024-001", "amountDue": "Rp 2,500,000", "dueDate": "December 31, 2024", "invoiceUrl": "https://app.hris.com/invoices/123"}'::JSONB,
 true),

-- Leave Request Submitted
('leave_request_submitted', 'Leave Request Submitted', 'Sent to employee when they submit a leave request', 'transactional',
 'Leave Request Submitted - {{companyName}}',
 '<h1>Leave Request Submitted</h1><p>Hi {{employeeName}},</p><p>Your leave request has been submitted successfully.</p><p><strong>Details:</strong><br>Type: {{leaveType}}<br>From: {{startDate}}<br>To: {{endDate}}<br>Days: {{totalDays}}</p><p>Your manager will review and respond soon.</p>',
 'Leave Request Submitted\n\nHi {{employeeName}},\n\nYour leave request has been submitted successfully.\n\nDetails:\nType: {{leaveType}}\nFrom: {{startDate}}\nTo: {{endDate}}\nDays: {{totalDays}}\n\nYour manager will review and respond soon.',
 '["{{employeeName}}", "{{companyName}}", "{{leaveType}}", "{{startDate}}", "{{endDate}}", "{{totalDays}}"]'::JSONB,
 '{"employeeName": "John Doe", "companyName": "ACME Corp", "leaveType": "Annual Leave", "startDate": "Jan 15, 2025", "endDate": "Jan 20, 2025", "totalDays": "5"}'::JSONB,
 true),

-- Payslip Ready
('payslip_ready', 'Payslip Ready', 'Sent when monthly payslip is available', 'transactional',
 'Your Payslip for {{month}} is Ready - {{companyName}}',
 '<h1>Payslip Available</h1><p>Hi {{employeeName}},</p><p>Your payslip for {{month}} is now available for download.</p><p><a href="{{payslipUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Download Payslip</a></p>',
 'Payslip Available\n\nHi {{employeeName}},\n\nYour payslip for {{month}} is now available for download.\n\nDownload: {{payslipUrl}}',
 '["{{employeeName}}", "{{companyName}}", "{{month}}", "{{payslipUrl}}"]'::JSONB,
 '{"employeeName": "John Doe", "companyName": "ACME Corp", "month": "November 2024", "payslipUrl": "https://app.hris.com/payslips/123"}'::JSONB,
 true);

-- Enable Row Level Security (if needed in future)
-- ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
