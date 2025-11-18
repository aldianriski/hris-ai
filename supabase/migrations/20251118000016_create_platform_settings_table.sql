-- Platform Settings Table
-- Centralized platform-wide configuration management

CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Email Settings
  email_provider VARCHAR(50) DEFAULT 'smtp', -- 'smtp', 'sendgrid', 'mailgun', 'ses', 'resend'
  smtp_host VARCHAR(255),
  smtp_port INTEGER DEFAULT 587,
  smtp_username VARCHAR(255),
  smtp_password_encrypted TEXT, -- Encrypted password
  smtp_from_email VARCHAR(255),
  smtp_from_name VARCHAR(255),
  smtp_use_tls BOOLEAN DEFAULT TRUE,

  -- Payment Gateway Settings
  payment_gateway VARCHAR(50) DEFAULT 'stripe', -- 'stripe', 'paypal', 'midtrans'
  stripe_publishable_key TEXT,
  stripe_secret_key_encrypted TEXT, -- Encrypted
  stripe_webhook_secret_encrypted TEXT, -- Encrypted
  payment_currency VARCHAR(3) DEFAULT 'IDR',

  -- Storage Settings
  storage_provider VARCHAR(50) DEFAULT 'supabase', -- 'supabase', 's3', 'gcs', 'azure'
  storage_bucket VARCHAR(255),
  storage_region VARCHAR(100),
  max_file_size_mb INTEGER DEFAULT 10,
  allowed_file_types TEXT[], -- Array of allowed MIME types

  -- General Platform Settings
  platform_name VARCHAR(255) DEFAULT 'HRIS Platform',
  platform_url VARCHAR(500),
  support_email VARCHAR(255),
  support_phone VARCHAR(50),

  -- Feature Toggles (Global Defaults)
  enable_ai_features BOOLEAN DEFAULT FALSE,
  enable_webhooks BOOLEAN DEFAULT TRUE,
  enable_api_access BOOLEAN DEFAULT TRUE,

  -- Session & Security Settings
  session_timeout_minutes INTEGER DEFAULT 120,
  max_login_attempts INTEGER DEFAULT 5,
  password_min_length INTEGER DEFAULT 8,
  require_mfa BOOLEAN DEFAULT FALSE,

  -- Notification Settings
  enable_email_notifications BOOLEAN DEFAULT TRUE,
  enable_sms_notifications BOOLEAN DEFAULT FALSE,
  enable_push_notifications BOOLEAN DEFAULT FALSE,

  -- Compliance & Legal
  terms_of_service_url VARCHAR(500),
  privacy_policy_url VARCHAR(500),
  data_retention_days INTEGER DEFAULT 2555, -- ~7 years

  -- Maintenance Mode
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,

  -- Metadata
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_email_provider CHECK (email_provider IN ('smtp', 'sendgrid', 'mailgun', 'ses', 'resend', 'mock')),
  CONSTRAINT valid_payment_gateway CHECK (payment_gateway IN ('stripe', 'paypal', 'midtrans', 'manual')),
  CONSTRAINT valid_storage_provider CHECK (storage_provider IN ('supabase', 's3', 'gcs', 'azure', 'local'))
);

-- Create single settings row (singleton pattern)
INSERT INTO platform_settings (
  platform_name,
  smtp_from_email,
  smtp_from_name,
  support_email,
  payment_currency
) VALUES (
  'HRIS Platform',
  'noreply@hris-platform.com',
  'HRIS Platform',
  'support@hris-platform.com',
  'IDR'
);

-- Ensure only one row exists
CREATE UNIQUE INDEX idx_platform_settings_singleton ON platform_settings ((id IS NOT NULL));

-- Function to prevent deletion of settings
CREATE OR REPLACE FUNCTION prevent_settings_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Platform settings cannot be deleted. Use UPDATE to modify values.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_settings_deletion
  BEFORE DELETE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_settings_deletion();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_platform_settings_timestamp
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_timestamp();

-- Row Level Security
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view/edit settings
CREATE POLICY "Platform admins can manage settings"
  ON platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_admin')
    )
  );

-- Create audit log trigger for settings changes
CREATE OR REPLACE FUNCTION log_platform_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO platform_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    changes,
    ip_address,
    user_agent
  ) VALUES (
    NEW.updated_by,
    'platform_settings.updated',
    'platform_settings',
    NEW.id,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    'system',
    'system'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_platform_settings_changes
  AFTER UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION log_platform_settings_changes();

-- Indexes
CREATE INDEX idx_platform_settings_updated_at ON platform_settings(updated_at DESC);

COMMENT ON TABLE platform_settings IS 'Centralized platform-wide configuration and settings (singleton table)';
COMMENT ON COLUMN platform_settings.smtp_password_encrypted IS 'Encrypted SMTP password - use encryption at application layer';
COMMENT ON COLUMN platform_settings.stripe_secret_key_encrypted IS 'Encrypted Stripe secret key - use encryption at application layer';
