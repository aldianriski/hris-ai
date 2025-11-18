-- Platform Settings Table
-- Stores global platform configuration and settings

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- General Settings
  platform_name VARCHAR(255) DEFAULT 'HRIS Platform',
  platform_logo_url TEXT,
  support_email VARCHAR(255),
  support_phone VARCHAR(50),
  default_timezone VARCHAR(100) DEFAULT 'Asia/Jakarta',
  default_language VARCHAR(10) DEFAULT 'en',
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,

  -- Security Settings
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT true,
  password_require_lowercase BOOLEAN DEFAULT true,
  password_require_numbers BOOLEAN DEFAULT true,
  password_require_special BOOLEAN DEFAULT true,
  password_expiry_days INTEGER DEFAULT 90,
  session_timeout_minutes INTEGER DEFAULT 480,
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  enforce_mfa BOOLEAN DEFAULT false,
  allowed_email_domains TEXT[],

  -- Email Configuration
  smtp_host VARCHAR(255),
  smtp_port INTEGER DEFAULT 587,
  smtp_username VARCHAR(255),
  smtp_password_encrypted TEXT,
  smtp_from_email VARCHAR(255),
  smtp_from_name VARCHAR(255),
  smtp_use_tls BOOLEAN DEFAULT true,
  email_provider VARCHAR(50) DEFAULT 'smtp', -- smtp, sendgrid, ses, resend
  email_api_key_encrypted TEXT,

  -- AI Settings
  ai_enabled BOOLEAN DEFAULT true,
  ai_provider VARCHAR(50) DEFAULT 'openai', -- openai, anthropic, azure
  ai_api_key_encrypted TEXT,
  ai_model VARCHAR(100) DEFAULT 'gpt-4',
  ai_max_tokens INTEGER DEFAULT 2000,
  ai_temperature DECIMAL(3,2) DEFAULT 0.7,

  -- Payment Gateway Settings
  payment_gateway VARCHAR(50) DEFAULT 'stripe', -- stripe, midtrans
  payment_gateway_mode VARCHAR(20) DEFAULT 'test', -- test, live
  stripe_publishable_key VARCHAR(255),
  stripe_secret_key_encrypted TEXT,
  stripe_webhook_secret_encrypted TEXT,
  midtrans_client_key VARCHAR(255),
  midtrans_server_key_encrypted TEXT,

  -- System Limits
  max_tenants INTEGER,
  max_users_per_tenant INTEGER DEFAULT 1000,
  max_file_upload_mb INTEGER DEFAULT 10,
  max_storage_gb_per_tenant INTEGER DEFAULT 50,

  -- Feature Toggles (Global Defaults)
  enable_new_tenant_registration BOOLEAN DEFAULT true,
  enable_sso BOOLEAN DEFAULT false,
  enable_api_access BOOLEAN DEFAULT true,
  enable_webhooks BOOLEAN DEFAULT false,
  enable_audit_logs BOOLEAN DEFAULT true,

  -- Billing Settings
  tax_rate DECIMAL(5,2) DEFAULT 11.00, -- Indonesia PPN 11%
  tax_name VARCHAR(50) DEFAULT 'PPN',
  currency_code VARCHAR(3) DEFAULT 'IDR',
  billing_cycle_day INTEGER DEFAULT 1, -- Day of month for billing
  trial_period_days INTEGER DEFAULT 14,
  grace_period_days INTEGER DEFAULT 7, -- Days after invoice due before suspension

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),

  -- Ensure only one settings row exists
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000001'::UUID)
);

-- Create single settings row
INSERT INTO public.platform_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID)
ON CONFLICT (id) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_at ON public.platform_settings(updated_at);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only super admins can view/edit platform settings
CREATE POLICY "Super admins can view platform settings"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update platform settings"
  ON public.platform_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug = 'super_admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_platform_settings_timestamp
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_updated_at();

-- Grant permissions
GRANT SELECT, UPDATE ON public.platform_settings TO authenticated;

-- Comment on table
COMMENT ON TABLE public.platform_settings IS 'Global platform configuration and settings (singleton table)';
