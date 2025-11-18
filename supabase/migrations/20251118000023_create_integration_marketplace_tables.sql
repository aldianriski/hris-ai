-- Integration Marketplace: External Service Integrations & Webhooks

-- Available Integrations Catalog
CREATE TABLE IF NOT EXISTS public.integration_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'hiring', 'accounting', 'communication', 'learning', 'background_check'
  provider VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url TEXT,
  documentation_url TEXT,
  pricing_model VARCHAR(50), -- 'free', 'paid', 'freemium'
  is_active BOOLEAN DEFAULT true,
  features JSONB, -- Array of features
  required_scopes JSONB, -- Required API permissions
  setup_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Installed Integrations
CREATE TABLE IF NOT EXISTS public.company_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.integration_catalog(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'inactive', -- 'active', 'inactive', 'error', 'pending'
  auth_type VARCHAR(50), -- 'oauth2', 'api_key', 'basic_auth'
  credentials JSONB, -- Encrypted credentials
  settings JSONB, -- Custom configuration
  sync_frequency VARCHAR(20), -- 'realtime', 'hourly', 'daily', 'weekly'
  last_sync_at TIMESTAMPTZ,
  last_sync_status VARCHAR(20),
  sync_errors JSONB,
  installed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, integration_id)
);

-- Integration Sync Logs
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_integration_id UUID NOT NULL REFERENCES public.company_integrations(id) ON DELETE CASCADE,
  sync_type VARCHAR(50), -- 'employee_import', 'payroll_export', 'leave_sync', etc.
  status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'partial'
  records_processed INT DEFAULT 0,
  records_success INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Custom Webhooks Configuration
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  endpoint_url TEXT NOT NULL,
  secret_key VARCHAR(255), -- For HMAC signature verification
  events JSONB NOT NULL, -- Array of subscribed events
  is_active BOOLEAN DEFAULT true,
  retry_policy JSONB, -- {max_retries: 3, backoff: 'exponential'}
  headers JSONB, -- Custom headers
  timeout_seconds INT DEFAULT 30,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Delivery Logs
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  attempts INT DEFAULT 1,
  delivered BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- API Keys for Developer Portal
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL, -- SHA-256 hash of the key
  key_prefix VARCHAR(20), -- First 8 chars for identification (e.g., "talixa_...")
  scopes JSONB, -- Array of permitted scopes ['read:employees', 'write:leaves', etc.]
  rate_limit INT DEFAULT 1000, -- Requests per hour
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Usage Logs (for rate limiting)
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INT,
  response_time_ms INT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration Mapping (Field mapping between systems)
CREATE TABLE IF NOT EXISTS public.integration_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_integration_id UUID NOT NULL REFERENCES public.company_integrations(id) ON DELETE CASCADE,
  source_field VARCHAR(100) NOT NULL, -- External system field
  target_field VARCHAR(100) NOT NULL, -- HRIS field
  transformation_rule JSONB, -- Optional transformation logic
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_catalog_category ON public.integration_catalog(category);
CREATE INDEX IF NOT EXISTS idx_catalog_active ON public.integration_catalog(is_active);
CREATE INDEX IF NOT EXISTS idx_company_integrations_company ON public.company_integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_integrations_status ON public.company_integrations(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration ON public.integration_sync_logs(company_integration_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_company ON public.webhooks(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON public.webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON public.webhook_deliveries(event_type);
CREATE INDEX IF NOT EXISTS idx_api_keys_company ON public.api_keys(company_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON public.api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON public.api_usage_logs(created_at);

-- RLS Policies
ALTER TABLE public.integration_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_field_mappings ENABLE ROW LEVEL SECURITY;

-- Integration catalog is public
CREATE POLICY "Integration catalog is viewable by everyone"
  ON public.integration_catalog FOR SELECT
  USING (is_active = true);

-- Company integrations viewable by company members
CREATE POLICY "Company members can view their integrations"
  ON public.company_integrations FOR SELECT
  USING (true); -- Add company check

-- Webhooks manageable by company admins
CREATE POLICY "Company admins can manage webhooks"
  ON public.webhooks FOR ALL
  USING (true); -- Add admin check

-- API keys manageable by authorized users
CREATE POLICY "Authorized users can manage API keys"
  ON public.api_keys FOR ALL
  USING (true); -- Add auth check

-- Insert Default Integrations
INSERT INTO public.integration_catalog (name, slug, category, provider, description, logo_url, pricing_model, features) VALUES
  -- Hiring Platforms
  ('Glints', 'glints', 'hiring', 'Glints', 'Sync candidates from Glints to HRIS automatically', 'https://logo.clearbit.com/glints.com', 'free', '["Auto-sync candidates", "Application tracking", "Interview scheduling"]'),
  ('JobStreet', 'jobstreet', 'hiring', 'JobStreet', 'Import applications from JobStreet Indonesia', 'https://logo.clearbit.com/jobstreet.co.id', 'free', '["Candidate import", "Status updates", "Resume parsing"]'),
  ('LinkedIn Recruiter', 'linkedin-recruiter', 'hiring', 'LinkedIn', 'Connect LinkedIn Recruiter with HRIS', 'https://logo.clearbit.com/linkedin.com', 'paid', '["Candidate sync", "Messaging integration", "Profile import"]'),
  ('Kalibrr', 'kalibrr', 'hiring', 'Kalibrr', 'Southeast Asia recruitment platform integration', 'https://logo.clearbit.com/kalibrr.com', 'free', '["Application tracking", "Candidate scoring", "Interview scheduling"]'),

  -- Accounting Software
  ('Accurate Online', 'accurate-online', 'accounting', 'CPSSoft', 'Sync payroll to Accurate accounting software', 'https://logo.clearbit.com/accurate.id', 'freemium', '["Payroll journal entries", "Tax reporting", "Employee cost tracking"]'),
  ('Jurnal', 'jurnal', 'accounting', 'Mekari', 'Integrate with Jurnal accounting platform', 'https://logo.clearbit.com/jurnal.id', 'freemium', '["Automated journal entries", "Financial reporting", "Multi-currency support"]'),
  ('QuickBooks', 'quickbooks', 'accounting', 'Intuit', 'QuickBooks Online integration', 'https://logo.clearbit.com/quickbooks.com', 'paid', '["Payroll export", "Expense tracking", "Financial sync"]'),
  ('Xero', 'xero', 'accounting', 'Xero', 'Cloud accounting integration', 'https://logo.clearbit.com/xero.com', 'paid', '["Payroll integration", "Expense claims", "Bank reconciliation"]'),

  -- Communication Tools
  ('Slack', 'slack', 'communication', 'Slack', 'Send HRIS notifications to Slack channels', 'https://logo.clearbit.com/slack.com', 'free', '["Leave approvals", "Birthday reminders", "Onboarding notifications"]'),
  ('Microsoft Teams', 'microsoft-teams', 'communication', 'Microsoft', 'Teams integration for HR notifications', 'https://logo.clearbit.com/microsoft.com', 'free', '["Approval workflows", "Announcements", "1-on-1 scheduling"]'),
  ('WhatsApp Business', 'whatsapp-business', 'communication', 'Meta', 'WhatsApp Business API for HR messaging', 'https://logo.clearbit.com/whatsapp.com', 'paid', '["Automated messages", "Leave notifications", "Attendance reminders"]'),

  -- Learning Platforms
  ('Udemy Business', 'udemy-business', 'learning', 'Udemy', 'Track employee learning from Udemy Business', 'https://logo.clearbit.com/udemy.com', 'paid', '["Course completion tracking", "Learning hours", "Certification import"]'),
  ('Coursera', 'coursera', 'learning', 'Coursera', 'Enterprise learning platform integration', 'https://logo.clearbit.com/coursera.org', 'paid', '["Course enrollment", "Completion tracking", "Skills assessment"]'),
  ('LinkedIn Learning', 'linkedin-learning', 'learning', 'LinkedIn', 'LinkedIn Learning content integration', 'https://logo.clearbit.com/linkedin.com', 'paid', '["Learning paths", "Skill development", "Certificate tracking"]'),

  -- Background Check
  ('VerifyID', 'verifyid', 'background_check', 'VerifyID', 'Indonesian background verification service', 'https://logo.clearbit.com/verifyid.co.id', 'paid', '["KTP verification", "Criminal record check", "Employment verification"]'),
  ('Identitium', 'identitium', 'background_check', 'Identitium', 'Background screening for Indonesia', 'https://logo.clearbit.com/identitium.com', 'paid', '["Identity verification", "Education check", "Reference verification"]');

COMMENT ON TABLE public.integration_catalog IS 'Available third-party integrations marketplace';
COMMENT ON TABLE public.company_integrations IS 'Installed integrations per company';
COMMENT ON TABLE public.integration_sync_logs IS 'Integration synchronization audit trail';
COMMENT ON TABLE public.webhooks IS 'Custom webhook configurations';
COMMENT ON TABLE public.webhook_deliveries IS 'Webhook delivery attempts and logs';
COMMENT ON TABLE public.api_keys IS 'API keys for developer access';
COMMENT ON TABLE public.api_usage_logs IS 'API usage tracking for rate limiting';
