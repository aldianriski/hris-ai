-- Migration: Create audit_logs table for tracking all platform activity
-- Created: 2025-11-18
-- Description: Comprehensive audit trail of all platform and tenant actions

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,

  -- Actor
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  actor_role VARCHAR(100),
  actor_ip VARCHAR(45),

  -- Action
  action VARCHAR(100) NOT NULL, -- e.g., 'tenant.created', 'user.suspended'

  -- Resource
  resource_type VARCHAR(100), -- e.g., 'tenant', 'user', 'subscription'
  resource_id UUID,
  resource_name VARCHAR(255),

  -- Changes
  changes JSONB, -- { before: {}, after: {} }

  -- Request metadata
  user_agent TEXT,
  method VARCHAR(10), -- GET, POST, PUT, DELETE, PATCH
  endpoint VARCHAR(255),

  -- Severity
  severity VARCHAR(50) DEFAULT 'info', -- info, warning, critical

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON public.audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);

-- Composite index for common queries
CREATE INDEX idx_audit_logs_tenant_actor ON public.audit_logs(tenant_id, actor_id, created_at DESC);

-- Comments
COMMENT ON TABLE public.audit_logs IS 'Complete audit trail of all platform and tenant actions';
COMMENT ON COLUMN public.audit_logs.changes IS 'JSON object showing before/after state of modified fields';
COMMENT ON COLUMN public.audit_logs.action IS 'Action performed (e.g., tenant.created, user.updated, data.exported)';
COMMENT ON COLUMN public.audit_logs.severity IS 'Severity level: info (normal), warning (attention needed), critical (security/compliance)';
