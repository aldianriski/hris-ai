-- Migration: Create user_roles table for role assignments
-- Created: 2025-11-18
-- Description: Many-to-many relationship between users and roles with tenant context

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.platform_roles(id) ON DELETE CASCADE,

  -- Null for platform roles, specific tenant for tenant roles
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Scope restrictions (e.g., specific department)
  scope_type VARCHAR(50), -- department, team, etc.
  scope_id UUID, -- Reference to department_id, team_id, etc.

  -- Assignment tracking
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  -- Expiry (optional, for temporary access)
  expires_at TIMESTAMPTZ,

  -- Unique constraint: user can only have one instance of a role per tenant
  CONSTRAINT unique_user_role_tenant UNIQUE(user_id, role_id, tenant_id)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX idx_user_roles_tenant_id ON public.user_roles(tenant_id);
CREATE INDEX idx_user_roles_expires_at ON public.user_roles(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_user_roles_assigned_by ON public.user_roles(assigned_by);

-- Comments
COMMENT ON TABLE public.user_roles IS 'Assigns roles to users with optional tenant and scope restrictions';
COMMENT ON COLUMN public.user_roles.tenant_id IS 'NULL for platform roles, specific tenant_id for tenant roles';
COMMENT ON COLUMN public.user_roles.scope_type IS 'Optional restriction type (e.g., department, team)';
COMMENT ON COLUMN public.user_roles.scope_id IS 'ID of the restricted scope (e.g., department_id)';
COMMENT ON COLUMN public.user_roles.expires_at IS 'Optional expiry for temporary role assignments';
