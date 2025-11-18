-- Migration: Add tenant_id column to all existing tables
-- Created: 2025-11-18
-- Description: Adds tenant_id for multi-tenant data isolation

-- Add tenant_id column to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);

COMMENT ON COLUMN public.users.tenant_id IS 'The tenant (company) this user belongs to. NULL for platform admins.';

-- Note: Other tables (employees, departments, etc.) should have tenant_id added
-- when they are created or migrated. For now, we'll add them as we implement
-- each module to avoid errors if tables don't exist yet.

-- Employees table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employees') THEN
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON public.employees(tenant_id);
    COMMENT ON COLUMN public.employees.tenant_id IS 'The tenant (company) this employee belongs to';
  END IF;
END
$$;

-- Departments table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') THEN
    ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON public.departments(tenant_id);
    COMMENT ON COLUMN public.departments.tenant_id IS 'The tenant (company) this department belongs to';
  END IF;
END
$$;

-- Leave Requests table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leave_requests') THEN
    ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant_id ON public.leave_requests(tenant_id);
    COMMENT ON COLUMN public.leave_requests.tenant_id IS 'The tenant (company) this leave request belongs to';
  END IF;
END
$$;

-- Attendance Records table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance_records') THEN
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_attendance_records_tenant_id ON public.attendance_records(tenant_id);
    COMMENT ON COLUMN public.attendance_records.tenant_id IS 'The tenant (company) this attendance record belongs to';
  END IF;
END
$$;

-- Payroll Periods table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payroll_periods') THEN
    ALTER TABLE public.payroll_periods ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_payroll_periods_tenant_id ON public.payroll_periods(tenant_id);
    COMMENT ON COLUMN public.payroll_periods.tenant_id IS 'The tenant (company) this payroll period belongs to';
  END IF;
END
$$;

-- Payroll Details table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payroll_details') THEN
    ALTER TABLE public.payroll_details ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_payroll_details_tenant_id ON public.payroll_details(tenant_id);
    COMMENT ON COLUMN public.payroll_details.tenant_id IS 'The tenant (company) this payroll detail belongs to';
  END IF;
END
$$;

-- Performance Reviews table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'performance_reviews') THEN
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_performance_reviews_tenant_id ON public.performance_reviews(tenant_id);
    COMMENT ON COLUMN public.performance_reviews.tenant_id IS 'The tenant (company) this performance review belongs to';
  END IF;
END
$$;

-- Goals table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
    ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON public.goals(tenant_id);
    COMMENT ON COLUMN public.goals.tenant_id IS 'The tenant (company) this goal belongs to';
  END IF;
END
$$;

-- Documents table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON public.documents(tenant_id);
    COMMENT ON COLUMN public.documents.tenant_id IS 'The tenant (company) this document belongs to';
  END IF;
END
$$;
