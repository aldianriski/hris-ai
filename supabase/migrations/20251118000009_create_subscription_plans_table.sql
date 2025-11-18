-- Migration: Create subscription_plans table
-- Created: 2025-11-18
-- Description: Subscription plans for tenant billing and pricing

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan identification
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Pricing
  pricing_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pricing_annual DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'IDR',
  per_employee BOOLEAN DEFAULT false, -- Price per employee or flat rate

  -- Limits
  max_employees INTEGER, -- NULL = unlimited
  max_admins INTEGER DEFAULT 5,
  max_storage_gb INTEGER DEFAULT 10,
  max_api_calls_per_month INTEGER, -- NULL = unlimited

  -- Features (JSONB for flexibility)
  features JSONB DEFAULT '[]'::JSONB,
  enabled_modules TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- AI Features
  ai_features_enabled BOOLEAN DEFAULT false,
  ai_leave_approval BOOLEAN DEFAULT false,
  ai_anomaly_detection BOOLEAN DEFAULT false,
  ai_payroll_error_detection BOOLEAN DEFAULT false,

  -- Advanced Features
  custom_reports BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  sso_enabled BOOLEAN DEFAULT false,
  white_label_enabled BOOLEAN DEFAULT false,
  dedicated_support BOOLEAN DEFAULT false,
  sla_uptime VARCHAR(10), -- e.g., '99.9%'

  -- Trial
  trial_days INTEGER DEFAULT 0,

  -- Display & Ordering
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true, -- Show on pricing page
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  -- Stripe Integration
  stripe_product_id VARCHAR(255),
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_annual VARCHAR(255),

  -- Metadata
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  last_modified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscription_plans_slug ON public.subscription_plans(slug);
CREATE INDEX idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_public ON public.subscription_plans(is_public);
CREATE INDEX idx_subscription_plans_featured ON public.subscription_plans(is_featured);
CREATE INDEX idx_subscription_plans_sort_order ON public.subscription_plans(sort_order);

-- Trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.subscription_plans IS 'Subscription plans for tenant billing';
COMMENT ON COLUMN public.subscription_plans.per_employee IS 'If true, pricing is multiplied by employee count';
COMMENT ON COLUMN public.subscription_plans.features IS 'JSON array of feature descriptions for marketing';
COMMENT ON COLUMN public.subscription_plans.enabled_modules IS 'Array of HRIS modules available in this plan';

-- Insert default plans
INSERT INTO public.subscription_plans (
  slug,
  name,
  description,
  pricing_monthly,
  pricing_annual,
  currency,
  per_employee,
  max_employees,
  max_storage_gb,
  max_api_calls_per_month,
  features,
  enabled_modules,
  ai_features_enabled,
  custom_reports,
  api_access,
  sso_enabled,
  white_label_enabled,
  dedicated_support,
  trial_days,
  is_active,
  is_public,
  sort_order
) VALUES
  -- Free Trial
  (
    'trial',
    'Free Trial',
    'Try all features free for 14 days',
    0,
    0,
    'IDR',
    false,
    10,
    1,
    1000,
    '["All modules access", "AI features included", "Email support", "14-day trial period"]'::JSONB,
    ARRAY['employee_management', 'attendance', 'leave', 'payroll', 'performance', 'documents', 'compliance', 'workflows'],
    true,
    false,
    false,
    false,
    false,
    false,
    14,
    true,
    true,
    0
  ),

  -- Starter Plan
  (
    'starter',
    'Starter',
    'Perfect for small businesses getting started with HRIS',
    99000,
    950400, -- 20% discount (99,000 * 12 * 0.8)
    'IDR',
    false,
    50,
    10,
    10000,
    '["Up to 50 employees", "Core HRIS modules", "10GB storage", "Email support", "Mobile app access"]'::JSONB,
    ARRAY['employee_management', 'attendance', 'leave', 'payroll'],
    false,
    false,
    false,
    false,
    false,
    false,
    0,
    true,
    true,
    1
  ),

  -- Professional Plan
  (
    'professional',
    'Professional',
    'Advanced features with AI-powered automation',
    299000,
    2870400, -- 20% discount
    'IDR',
    false,
    200,
    50,
    50000,
    '["Up to 200 employees", "All HRIS modules", "AI leave approval", "AI anomaly detection", "Custom reports", "API access", "50GB storage", "Priority support"]'::JSONB,
    ARRAY['employee_management', 'attendance', 'leave', 'payroll', 'performance', 'documents', 'compliance', 'workflows'],
    true,
    true,
    true,
    false,
    false,
    false,
    0,
    true,
    true,
    2
  ),

  -- Enterprise Plan
  (
    'enterprise',
    'Enterprise',
    'Complete solution with white-label and dedicated support',
    0, -- Custom pricing
    0, -- Custom pricing
    'IDR',
    false,
    NULL, -- Unlimited
    500,
    NULL, -- Unlimited
    '["Unlimited employees", "All features", "White-label branding", "SSO integration", "Dedicated support", "99.9% SLA", "Custom integrations", "Onboarding assistance", "Account manager"]'::JSONB,
    ARRAY['employee_management', 'attendance', 'leave', 'payroll', 'performance', 'documents', 'compliance', 'workflows'],
    true,
    true,
    true,
    true,
    true,
    true,
    0,
    true,
    true,
    3
  );
