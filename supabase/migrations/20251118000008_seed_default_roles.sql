-- Migration: Seed default platform and tenant roles
-- Created: 2025-11-18
-- Description: Creates system roles for RBAC

-- ============================================
-- PLATFORM ROLES (Internal Team)
-- ============================================

INSERT INTO public.platform_roles (name, slug, type, permissions, is_system_role, scope, description)
VALUES
  (
    'Super Admin',
    'super_admin',
    'platform',
    '["*"]'::jsonb,
    true,
    'global',
    'Full platform access - can manage all tenants, users, billing, and system settings'
  ),
  (
    'Platform Support',
    'platform_support',
    'platform',
    '[
      "tenant.read",
      "tenant.update",
      "user.read",
      "user.update",
      "user.impersonate",
      "support_ticket.*",
      "audit_log.read",
      "billing.read"
    ]'::jsonb,
    true,
    'global',
    'Customer support access - can view tenant data, assist customers, and impersonate users for troubleshooting'
  ),
  (
    'Platform Sales',
    'platform_sales',
    'platform',
    '[
      "tenant.create",
      "tenant.read",
      "demo.create",
      "analytics.read",
      "user.read"
    ]'::jsonb,
    true,
    'global',
    'Sales team access - can create demo tenants, view analytics, and onboard new customers'
  ),
  (
    'Platform Developer',
    'platform_developer',
    'platform',
    '[
      "audit_log.read",
      "logs.read",
      "monitoring.read",
      "tenant.read",
      "feature_flag.*"
    ]'::jsonb,
    true,
    'global',
    'Development team access - can access logs, monitoring, and manage feature flags for debugging'
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- TENANT ROLES (Customer Company Users)
-- ============================================

INSERT INTO public.platform_roles (name, slug, type, permissions, is_system_role, scope, description)
VALUES
  (
    'Company Admin',
    'company_admin',
    'tenant',
    '[
      "company.*",
      "user.*",
      "employee.*",
      "department.*",
      "payroll.*",
      "leave.*",
      "attendance.*",
      "performance.*",
      "document.*",
      "billing.read",
      "billing.update",
      "settings.*",
      "analytics.read"
    ]'::jsonb,
    true,
    'tenant',
    'Full company access - tenant owner with complete control over all modules and settings'
  ),
  (
    'HR Manager',
    'hr_manager',
    'tenant',
    '[
      "employee.*",
      "leave.*",
      "attendance.*",
      "performance.*",
      "document.*",
      "department.read",
      "user.read",
      "analytics.read"
    ]'::jsonb,
    true,
    'tenant',
    'HR department access - can manage employees, leave, attendance, performance reviews, and documents'
  ),
  (
    'Payroll Manager',
    'payroll_manager',
    'tenant',
    '[
      "employee.read",
      "payroll.*",
      "attendance.read",
      "leave.read",
      "compliance.read",
      "analytics.read"
    ]'::jsonb,
    true,
    'tenant',
    'Payroll access - can process payroll, generate payslips, and manage compensation'
  ),
  (
    'Department Manager',
    'department_manager',
    'tenant',
    '[
      "employee.read",
      "leave.read",
      "leave.approve",
      "attendance.read",
      "performance.read",
      "performance.create",
      "performance.update"
    ]'::jsonb,
    true,
    'department',
    'Department-level access - can approve leave requests and manage performance reviews for their department only'
  ),
  (
    'Employee',
    'employee',
    'tenant',
    '[
      "profile.read",
      "profile.update",
      "attendance.own",
      "leave.own",
      "payslip.own",
      "performance.own",
      "document.own"
    ]'::jsonb,
    true,
    'self',
    'Self-service access - employees can view their own data, request leave, check payslips, and update profiles'
  )
ON CONFLICT (slug) DO NOTHING;

-- Comments
COMMENT ON TABLE public.platform_roles IS 'System roles have been seeded. Do not modify is_system_role=true roles manually.';

-- ============================================
-- PREDEFINED FEATURE FLAGS
-- ============================================

INSERT INTO public.feature_flags (key, name, description, enabled, rollout_type)
VALUES
  ('ai_leave_approval', 'AI Leave Auto-Approval', 'Enable AI-powered automatic leave approval for high-confidence requests', true, 'global'),
  ('ai_anomaly_detection', 'AI Attendance Anomaly Detection', 'Enable AI-powered fraud detection for attendance records', true, 'global'),
  ('payroll_error_detection', 'Payroll Error Detection', 'Enable AI-powered payroll error detection before processing', true, 'global'),
  ('mobile_pwa', 'Mobile PWA', 'Enable Progressive Web App features for mobile devices', false, 'percentage'),
  ('sso_login', 'SSO Login', 'Enable Single Sign-On (SSO) authentication', false, 'whitelist'),
  ('custom_reports', 'Custom Reports Builder', 'Enable custom report builder for advanced analytics', false, 'percentage'),
  ('api_access', 'API Access', 'Enable REST API access for integrations', false, 'whitelist'),
  ('white_label', 'White Label Branding', 'Enable custom branding and white-label capabilities', false, 'whitelist'),
  ('workflow_automation', 'Workflow Automation', 'Enable automated workflow builder', false, 'percentage')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Default roles and feature flags seeded successfully!';
  RAISE NOTICE '📋 Platform Roles: Super Admin, Platform Support, Platform Sales, Platform Developer';
  RAISE NOTICE '🏢 Tenant Roles: Company Admin, HR Manager, Payroll Manager, Department Manager, Employee';
  RAISE NOTICE '🚩 Feature Flags: 9 feature flags created';
END
$$;
