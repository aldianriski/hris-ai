-- Migration: Enable Row Level Security (RLS) policies
-- Created: 2025-11-18
-- Description: RLS policies for multi-tenant data isolation

-- Helper function to check if user is a platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.platform_roles pr ON ur.role_id = pr.id
    WHERE ur.user_id = user_id
      AND pr.slug IN ('super_admin', 'platform_support', 'platform_developer')
      AND pr.type = 'platform'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT tenant_id FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TENANTS TABLE RLS
-- ============================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Platform admins can access all tenants
CREATE POLICY platform_admin_tenants_all ON public.tenants
  FOR ALL
  USING (public.is_platform_admin(auth.uid()));

-- Policy: Company admins can read their own tenant
CREATE POLICY company_admin_tenants_read ON public.tenants
  FOR SELECT
  USING (
    id = public.get_user_tenant_id(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
        AND pr.slug = 'company_admin'
        AND ur.tenant_id = public.tenants.id
    )
  );

-- Policy: Company admins can update their own tenant (limited fields)
CREATE POLICY company_admin_tenants_update ON public.tenants
  FOR UPDATE
  USING (
    id = public.get_user_tenant_id(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
        AND pr.slug = 'company_admin'
        AND ur.tenant_id = public.tenants.id
    )
  );

-- ============================================
-- USERS TABLE RLS
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY users_own_profile ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Policy: Users can update their own profile
CREATE POLICY users_update_own_profile ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- Policy: Platform admins can access all users
CREATE POLICY platform_admin_users_all ON public.users
  FOR ALL
  USING (public.is_platform_admin(auth.uid()));

-- Policy: Company admins and HR managers can read users in their tenant
CREATE POLICY tenant_users_read ON public.users
  FOR SELECT
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
        AND pr.slug IN ('company_admin', 'hr_manager')
    )
  );

-- ============================================
-- EMPLOYEES TABLE RLS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employees') THEN
    ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

    -- Platform admins can access all
    EXECUTE 'CREATE POLICY platform_admin_employees_all ON public.employees
      FOR ALL
      USING (public.is_platform_admin(auth.uid()))';

    -- Tenant isolation: Users can only access employees from their tenant
    EXECUTE 'CREATE POLICY tenant_isolation_employees ON public.employees
      FOR ALL
      USING (tenant_id = public.get_user_tenant_id(auth.uid()))';
  END IF;
END
$$;

-- ============================================
-- DEPARTMENTS TABLE RLS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') THEN
    ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY platform_admin_departments_all ON public.departments
      FOR ALL
      USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY tenant_isolation_departments ON public.departments
      FOR ALL
      USING (tenant_id = public.get_user_tenant_id(auth.uid()))';
  END IF;
END
$$;

-- ============================================
-- LEAVE REQUESTS TABLE RLS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leave_requests') THEN
    ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY platform_admin_leave_requests_all ON public.leave_requests
      FOR ALL
      USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY tenant_isolation_leave_requests ON public.leave_requests
      FOR ALL
      USING (tenant_id = public.get_user_tenant_id(auth.uid()))';
  END IF;
END
$$;

-- ============================================
-- ATTENDANCE RECORDS TABLE RLS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance_records') THEN
    ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY platform_admin_attendance_records_all ON public.attendance_records
      FOR ALL
      USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY tenant_isolation_attendance_records ON public.attendance_records
      FOR ALL
      USING (tenant_id = public.get_user_tenant_id(auth.uid()))';
  END IF;
END
$$;

-- ============================================
-- PAYROLL PERIODS TABLE RLS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payroll_periods') THEN
    ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY platform_admin_payroll_periods_all ON public.payroll_periods
      FOR ALL
      USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY tenant_isolation_payroll_periods ON public.payroll_periods
      FOR ALL
      USING (tenant_id = public.get_user_tenant_id(auth.uid()))';
  END IF;
END
$$;

-- ============================================
-- PAYROLL DETAILS TABLE RLS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payroll_details') THEN
    ALTER TABLE public.payroll_details ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY platform_admin_payroll_details_all ON public.payroll_details
      FOR ALL
      USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY tenant_isolation_payroll_details ON public.payroll_details
      FOR ALL
      USING (tenant_id = public.get_user_tenant_id(auth.uid()))';
  END IF;
END
$$;

-- ============================================
-- PERFORMANCE REVIEWS TABLE RLS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'performance_reviews') THEN
    ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY platform_admin_performance_reviews_all ON public.performance_reviews
      FOR ALL
      USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY tenant_isolation_performance_reviews ON public.performance_reviews
      FOR ALL
      USING (tenant_id = public.get_user_tenant_id(auth.uid()))';
  END IF;
END
$$;

-- ============================================
-- GOALS TABLE RLS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
    ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY platform_admin_goals_all ON public.goals
      FOR ALL
      USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY tenant_isolation_goals ON public.goals
      FOR ALL
      USING (tenant_id = public.get_user_tenant_id(auth.uid()))';
  END IF;
END
$$;

-- ============================================
-- DOCUMENTS TABLE RLS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY platform_admin_documents_all ON public.documents
      FOR ALL
      USING (public.is_platform_admin(auth.uid()))';

    EXECUTE 'CREATE POLICY tenant_isolation_documents ON public.documents
      FOR ALL
      USING (tenant_id = public.get_user_tenant_id(auth.uid()))';
  END IF;
END
$$;

-- ============================================
-- PLATFORM_ROLES TABLE RLS
-- ============================================

ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read roles (needed for permission checks)
CREATE POLICY platform_roles_read_all ON public.platform_roles
  FOR SELECT
  USING (true);

-- Policy: Only platform admins can modify roles
CREATE POLICY platform_admin_roles_modify ON public.platform_roles
  FOR ALL
  USING (public.is_platform_admin(auth.uid()));

-- ============================================
-- USER_ROLES TABLE RLS
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role assignments
CREATE POLICY user_roles_read_own ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Platform admins can manage all role assignments
CREATE POLICY platform_admin_user_roles_all ON public.user_roles
  FOR ALL
  USING (public.is_platform_admin(auth.uid()));

-- Policy: Company admins can manage role assignments in their tenant
CREATE POLICY company_admin_user_roles_tenant ON public.user_roles
  FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
        AND pr.slug = 'company_admin'
        AND ur.tenant_id = public.user_roles.tenant_id
    )
  );

-- ============================================
-- AUDIT_LOGS TABLE RLS
-- ============================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Platform admins can read all audit logs
CREATE POLICY platform_admin_audit_logs_read ON public.audit_logs
  FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

-- Policy: Company admins can read audit logs for their tenant
CREATE POLICY company_admin_audit_logs_read ON public.audit_logs
  FOR SELECT
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
        AND pr.slug = 'company_admin'
        AND ur.tenant_id = public.audit_logs.tenant_id
    )
  );

-- Policy: System can insert audit logs (needed for logging functions)
CREATE POLICY audit_logs_insert_system ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FEATURE_FLAGS TABLE RLS
-- ============================================

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read feature flags (needed for feature checks)
CREATE POLICY feature_flags_read_all ON public.feature_flags
  FOR SELECT
  USING (true);

-- Policy: Only platform admins can modify feature flags
CREATE POLICY platform_admin_feature_flags_modify ON public.feature_flags
  FOR ALL
  USING (public.is_platform_admin(auth.uid()));

-- Comments
COMMENT ON FUNCTION public.is_platform_admin IS 'Helper function to check if a user has platform admin privileges';
COMMENT ON FUNCTION public.get_user_tenant_id IS 'Helper function to get a user''s tenant_id';
