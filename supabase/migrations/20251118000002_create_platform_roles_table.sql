-- Migration: Create platform_roles table for RBAC
-- Created: 2025-11-18
-- Description: Stores roles for both platform admins and tenant users

CREATE TABLE IF NOT EXISTS public.platform_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,

  type VARCHAR(50) NOT NULL, -- 'platform' or 'tenant'

  -- Permissions (array of permission slugs)
  permissions JSONB NOT NULL DEFAULT '[]',

  -- System roles cannot be deleted/modified
  is_system_role BOOLEAN DEFAULT false,

  -- Scope
  scope VARCHAR(50) DEFAULT 'global', -- global, tenant, department, self

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_platform_roles_slug ON public.platform_roles(slug);
CREATE INDEX idx_platform_roles_type ON public.platform_roles(type);
CREATE INDEX idx_platform_roles_is_active ON public.platform_roles(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_platform_roles_updated_at
  BEFORE UPDATE ON public.platform_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.platform_roles IS 'Roles for both platform admins and tenant users';
COMMENT ON COLUMN public.platform_roles.type IS 'platform: for super admins, tenant: for customer company users';
COMMENT ON COLUMN public.platform_roles.scope IS 'Scope of permissions: global, tenant, department, or self';
COMMENT ON COLUMN public.platform_roles.permissions IS 'Array of permission slugs (e.g., ["employee.create", "payroll.approve"])';
