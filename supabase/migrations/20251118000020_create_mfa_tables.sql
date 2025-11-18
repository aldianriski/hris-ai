-- Multi-Factor Authentication Tables
-- Stores user MFA preferences and backup codes

-- User MFA Settings Table
CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- MFA Status
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_method VARCHAR(20) DEFAULT 'totp', -- totp, sms, email

  -- TOTP Settings
  totp_secret TEXT, -- Encrypted TOTP secret
  totp_verified_at TIMESTAMPTZ,

  -- SMS Settings
  phone_number VARCHAR(20),
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMPTZ,

  -- Email Settings (uses auth.users.email)
  email_verified_at TIMESTAMPTZ,

  -- Backup Codes (hashed)
  backup_codes TEXT[], -- Array of hashed backup codes
  backup_codes_generated_at TIMESTAMPTZ,

  -- Recovery
  recovery_email VARCHAR(255),
  recovery_email_verified BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_mfa UNIQUE (user_id)
);

-- MFA Verification Attempts Table (for rate limiting and security)
CREATE TABLE IF NOT EXISTS public.mfa_verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Attempt Details
  method VARCHAR(20) NOT NULL, -- totp, sms, email, backup_code
  success BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,

  -- Metadata
  attempted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for rate limiting queries
  CONSTRAINT idx_mfa_attempts_user_time
    CHECK (attempted_at IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_user_id
  ON public.user_mfa_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_enabled
  ON public.user_mfa_settings(user_id, mfa_enabled);

CREATE INDEX IF NOT EXISTS idx_mfa_verification_attempts_user_time
  ON public.mfa_verification_attempts(user_id, attempted_at DESC);

-- Enable RLS
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_verification_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_mfa_settings
-- Users can view and update their own MFA settings
CREATE POLICY "Users can view own MFA settings"
  ON public.user_mfa_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own MFA settings"
  ON public.user_mfa_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own MFA settings"
  ON public.user_mfa_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Super admins can view all MFA settings (for support)
CREATE POLICY "Super admins can view all MFA settings"
  ON public.user_mfa_settings
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

-- RLS Policies for mfa_verification_attempts
-- Users can view their own attempts
CREATE POLICY "Users can view own MFA attempts"
  ON public.mfa_verification_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own MFA attempts"
  ON public.mfa_verification_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Super admins can view all attempts (for security monitoring)
CREATE POLICY "Super admins can view all MFA attempts"
  ON public.mfa_verification_attempts
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_mfa_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_mfa_settings_timestamp
  BEFORE UPDATE ON public.user_mfa_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_mfa_settings_updated_at();

-- Function to clean old verification attempts (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_mfa_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.mfa_verification_attempts
  WHERE attempted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_mfa_settings TO authenticated;
GRANT SELECT, INSERT ON public.mfa_verification_attempts TO authenticated;

-- Comments
COMMENT ON TABLE public.user_mfa_settings IS 'User multi-factor authentication settings and preferences';
COMMENT ON TABLE public.mfa_verification_attempts IS 'MFA verification attempts log for security monitoring and rate limiting';
COMMENT ON COLUMN public.user_mfa_settings.totp_secret IS 'Encrypted TOTP secret for authenticator apps (Google Authenticator, Authy, etc.)';
COMMENT ON COLUMN public.user_mfa_settings.backup_codes IS 'Hashed backup codes for account recovery (10 codes, single-use)';
