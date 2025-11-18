-- Migration: Create compliance_alerts table
-- Created: 2025-11-18
-- Description: Platform-wide compliance monitoring and alerts

CREATE TABLE IF NOT EXISTS public.compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Alert Identification
  alert_type VARCHAR(100) NOT NULL, -- e.g., 'missing_tax_id', 'expired_document', 'incomplete_payroll'
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Tenant Association
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  tenant_name VARCHAR(255), -- Denormalized for quick access

  -- Alert Details
  affected_resource_type VARCHAR(100), -- 'employee', 'document', 'payroll_period', etc.
  affected_resource_id UUID,
  affected_count INTEGER DEFAULT 1, -- Number of affected items

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,

  -- Automation
  auto_detected BOOLEAN DEFAULT true,
  detection_rule VARCHAR(255), -- Rule that triggered the alert
  recurrence_count INTEGER DEFAULT 1, -- How many times this alert has occurred

  -- Metadata
  metadata JSONB DEFAULT '{}', -- Additional context
  due_date TIMESTAMPTZ, -- When this must be resolved by

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_compliance_alerts_tenant ON public.compliance_alerts(tenant_id);
CREATE INDEX idx_compliance_alerts_status ON public.compliance_alerts(status);
CREATE INDEX idx_compliance_alerts_severity ON public.compliance_alerts(severity);
CREATE INDEX idx_compliance_alerts_type ON public.compliance_alerts(alert_type);
CREATE INDEX idx_compliance_alerts_created ON public.compliance_alerts(created_at DESC);
CREATE INDEX idx_compliance_alerts_open ON public.compliance_alerts(status, severity) WHERE status = 'open';

-- Updated at trigger
CREATE TRIGGER update_compliance_alerts_updated_at
  BEFORE UPDATE ON public.compliance_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.compliance_alerts IS 'Platform-wide compliance monitoring and alerts';
COMMENT ON COLUMN public.compliance_alerts.alert_type IS 'Type of compliance issue detected';
COMMENT ON COLUMN public.compliance_alerts.severity IS 'Severity level: info, warning, critical';
COMMENT ON COLUMN public.compliance_alerts.affected_count IS 'Number of items affected by this alert';
COMMENT ON COLUMN public.compliance_alerts.recurrence_count IS 'Number of times this alert has recurred';

-- Seed sample compliance alerts for demonstration
INSERT INTO public.compliance_alerts (alert_type, severity, title, description, tenant_id, tenant_name, affected_resource_type, affected_count, status, metadata) VALUES
-- Get a random tenant for demo purposes (will fail gracefully if no tenants exist)
(
  'missing_tax_documents',
  'warning',
  'Missing Tax Documents',
  'Some employees are missing required tax documentation (NPWP)',
  (SELECT id FROM public.tenants WHERE status = 'active' LIMIT 1),
  (SELECT company_name FROM public.tenants WHERE status = 'active' LIMIT 1),
  'employee',
  5,
  'open',
  '{"missing_document": "NPWP", "employees_affected": ["emp_001", "emp_002"]}'::JSONB
),
(
  'payroll_not_processed',
  'critical',
  'Payroll Overdue',
  'Monthly payroll has not been processed for the current period',
  (SELECT id FROM public.tenants WHERE status = 'active' OFFSET 1 LIMIT 1),
  (SELECT company_name FROM public.tenants WHERE status = 'active' OFFSET 1 LIMIT 1),
  'payroll_period',
  1,
  'open',
  '{"period": "November 2024", "due_date": "2024-12-05"}'::JSONB
),
(
  'incomplete_employee_profiles',
  'info',
  'Incomplete Employee Profiles',
  'Multiple employees have incomplete profile information',
  (SELECT id FROM public.tenants WHERE status = 'active' OFFSET 2 LIMIT 1),
  (SELECT company_name FROM public.tenants WHERE status = 'active' OFFSET 2 LIMIT 1),
  'employee',
  12,
  'open',
  '{"missing_fields": ["bank_account", "emergency_contact"]}'::JSONB
);

-- Enable Row Level Security (platform admins only)
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Platform admins can view all compliance alerts
CREATE POLICY platform_admin_view_compliance_alerts ON public.compliance_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_users
      WHERE platform_users.user_id = auth.uid()
      AND platform_users.role IN ('super_admin', 'platform_admin', 'platform_support')
    )
  );

-- Policy: Platform admins can manage compliance alerts
CREATE POLICY platform_admin_manage_compliance_alerts ON public.compliance_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_users
      WHERE platform_users.user_id = auth.uid()
      AND platform_users.role IN ('super_admin', 'platform_admin')
    )
  );
