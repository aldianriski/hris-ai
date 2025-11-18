-- Advanced Audit Trail & GDPR Compliance

-- Enhanced Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID UNIQUE DEFAULT gen_random_uuid(), -- For blockchain-like linking
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'read', 'export', 'login', 'logout'
  resource_type VARCHAR(100) NOT NULL, -- 'employee', 'payroll', 'leave', 'document', etc.
  resource_id UUID,
  changes JSONB, -- Before/After values for updates
  ip_address INET,
  user_agent TEXT,
  device_info JSONB, -- Browser, OS, device type
  geolocation JSONB, -- {lat, lng, city, country}
  session_id UUID,
  api_endpoint TEXT,
  request_method VARCHAR(10),
  response_status INT,
  execution_time_ms INT,
  metadata JSONB, -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Field-Level Change Tracking
CREATE TABLE IF NOT EXISTS public.field_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id UUID REFERENCES public.audit_logs(id) ON DELETE CASCADE,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- GDPR Compliance: Data Processing Agreements
CREATE TABLE IF NOT EXISTS public.data_processing_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreement_type VARCHAR(50) NOT NULL, -- 'terms_of_service', 'privacy_policy', 'data_processing', 'marketing_consent'
  version VARCHAR(20) NOT NULL,
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GDPR: Data Export Requests
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type VARCHAR(20) NOT NULL DEFAULT 'export', -- 'export' or 'delete'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  download_url TEXT,
  download_expires_at TIMESTAMPTZ,
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Session Tracking for Security
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  device_name VARCHAR(100),
  location JSONB, -- {city, country, lat, lng}
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Events Log
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL, -- 'failed_login', 'password_changed', 'mfa_enabled', 'suspicious_activity'
  severity VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_field_changes_audit_log ON public.field_change_history(audit_log_id);
CREATE INDEX IF NOT EXISTS idx_field_changes_record ON public.field_change_history(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_agreements_user ON public.data_processing_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_user ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_status ON public.data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);

-- RLS Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Audit logs viewable by admins and the user themselves
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Field changes viewable by admins
CREATE POLICY "Admins can view field changes"
  ON public.field_change_history FOR SELECT
  USING (true); -- Add admin check

-- Users can view their own GDPR agreements
CREATE POLICY "Users can view their own agreements"
  ON public.data_processing_agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create agreements"
  ON public.data_processing_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can create data export requests
CREATE POLICY "Users can create export requests"
  ON public.data_export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own export requests"
  ON public.data_export_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Security events viewable by admins
CREATE POLICY "Admins can view security events"
  ON public.security_events FOR SELECT
  USING (true); -- Add admin check

-- Function to create audit log (call from triggers)
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    changes
  ) VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
        'before', to_jsonb(OLD),
        'after', to_jsonb(NEW)
      )
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail of all system actions';
COMMENT ON TABLE public.field_change_history IS 'Field-level change tracking for compliance';
COMMENT ON TABLE public.data_processing_agreements IS 'GDPR consent management';
COMMENT ON TABLE public.data_export_requests IS 'GDPR right to data portability';
COMMENT ON TABLE public.user_sessions IS 'Active user sessions for security monitoring';
COMMENT ON TABLE public.security_events IS 'Security incidents and anomalies';
