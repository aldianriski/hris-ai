-- Migration: Create feature_flags table for gradual rollouts
-- Created: 2025-11-18
-- Description: Feature flags for controlling feature availability and A/B testing

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Global toggle
  enabled BOOLEAN DEFAULT false,

  -- Rollout strategy
  rollout_type VARCHAR(50) DEFAULT 'global', -- global, percentage, whitelist, blacklist
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),

  -- Tenant targeting
  tenant_whitelist UUID[] DEFAULT ARRAY[]::UUID[],
  tenant_blacklist UUID[] DEFAULT ARRAY[]::UUID[],

  -- Scheduling
  enable_at TIMESTAMPTZ,
  disable_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  last_modified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX idx_feature_flags_enabled ON public.feature_flags(enabled);
CREATE INDEX idx_feature_flags_rollout_type ON public.feature_flags(rollout_type);

-- Trigger for updated_at
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.feature_flags IS 'Feature flags for gradual rollouts and A/B testing';
COMMENT ON COLUMN public.feature_flags.rollout_type IS 'Strategy: global (all), percentage (X%), whitelist (specific tenants), blacklist (exclude tenants)';
COMMENT ON COLUMN public.feature_flags.rollout_percentage IS 'Percentage of tenants to enable (0-100), used when rollout_type is percentage';
COMMENT ON COLUMN public.feature_flags.tenant_whitelist IS 'Array of tenant IDs to explicitly enable this feature for';
COMMENT ON COLUMN public.feature_flags.tenant_blacklist IS 'Array of tenant IDs to explicitly disable this feature for';
