-- Migration: Create tenants table for multi-tenant support
-- Created: 2025-11-18
-- Description: Stores information about customer companies (tenants) using the platform

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company Info
  company_name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  industry VARCHAR(100),
  company_size VARCHAR(50), -- '1-10', '11-50', '51-200', '201-500', '500+'

  -- Contact
  primary_admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  support_email VARCHAR(255),
  billing_email VARCHAR(255),

  -- Subscription
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'trial', -- trial, starter, professional, enterprise
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, trial, suspended, cancelled
  trial_ends_at TIMESTAMPTZ,
  subscription_starts_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,

  -- Limits
  max_employees INTEGER DEFAULT 10,
  max_storage_gb INTEGER DEFAULT 1,
  max_api_calls_per_month INTEGER DEFAULT 10000,

  -- Usage Tracking
  current_employee_count INTEGER DEFAULT 0,
  current_storage_gb DECIMAL(10,2) DEFAULT 0,
  current_api_calls INTEGER DEFAULT 0,

  -- Billing Integration
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),

  -- White-label
  custom_domain VARCHAR(255),
  logo_url VARCHAR(500),
  favicon_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#6366f1',
  secondary_color VARCHAR(7) DEFAULT '#8b5cf6',

  -- Location
  country VARCHAR(100) DEFAULT 'Indonesia',
  timezone VARCHAR(100) DEFAULT 'Asia/Jakarta',
  currency VARCHAR(3) DEFAULT 'IDR',

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled, deleted
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,

  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
  feature_flags JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_status ON public.tenants(status);
CREATE INDEX idx_tenants_subscription_plan ON public.tenants(subscription_plan);
CREATE INDEX idx_tenants_subscription_status ON public.tenants(subscription_status);
CREATE INDEX idx_tenants_created_at ON public.tenants(created_at DESC);
CREATE INDEX idx_tenants_primary_admin_id ON public.tenants(primary_admin_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for tenants updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.tenants IS 'Multi-tenant companies using the platform';
COMMENT ON COLUMN public.tenants.slug IS 'URL-friendly identifier for tenant';
COMMENT ON COLUMN public.tenants.onboarding_progress IS 'Percentage of onboarding checklist completed (0-100)';
COMMENT ON COLUMN public.tenants.feature_flags IS 'Tenant-specific feature flag overrides';
COMMENT ON COLUMN public.tenants.settings IS 'Tenant-specific settings and configurations';
