# Sprint 13 Implementation Plan: Platform Admin Core
## HRIS AI - CMS Admin Panel Foundation

**Sprint Duration:** 3 weeks (15 working days)
**Priority:** CRITICAL
**Status:** Planning → Implementation
**Date:** 2025-11-18

---

## 📋 Sprint Overview

This sprint establishes the foundation for the multi-tenant SaaS platform by implementing:
1. Multi-tenant database schema with RLS
2. Super Admin Dashboard with KPIs
3. Tenant Management (CRUD + detail views)
4. Platform-wide User Management
5. RBAC foundation (roles & permissions)

---

## 🎯 Sprint Goals

### **Primary Objectives**
- ✅ Implement multi-tenant database architecture
- ✅ Create platform admin route group & layout
- ✅ Build Super Admin Dashboard with real-time metrics
- ✅ Implement complete Tenant Management system
- ✅ Build User Management across all tenants
- ✅ Establish RBAC system foundation

### **Success Criteria**
- [ ] Super Admin can create new tenants in <2 minutes
- [ ] Dashboard loads platform metrics in <1 second
- [ ] All queries properly filter by tenant_id (RLS)
- [ ] Can view and manage all tenants from single interface
- [ ] Can impersonate users for support (with audit trail)
- [ ] Role-based permissions properly enforced

---

## 📅 Sprint Timeline

### **Week 1: Database & Foundation (Days 1-5)**
- **Day 1-2:** Multi-tenant database schema + migrations
- **Day 3:** Platform admin route structure + layouts
- **Day 4:** RBAC tables & seed data
- **Day 5:** Platform services & API types

### **Week 2: Dashboard & Tenant Management (Days 6-10)**
- **Day 6-7:** Super Admin Dashboard (metrics + charts)
- **Day 8-9:** Tenant List + Search/Filters
- **Day 10:** Tenant Creation Wizard (4 steps)

### **Week 3: Tenant Details & User Management (Days 11-15)**
- **Day 11-12:** Tenant Detail View (7 tabs)
- **Day 13-14:** Platform User Management
- **Day 15:** Testing, bug fixes, documentation

---

## 🗄️ Database Implementation

### **Phase 1: Core Tables**

#### **1. Tenants Table**
```sql
-- migrations/00XX_create_tenants_table.sql

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
  onboarding_progress INTEGER DEFAULT 0, -- 0-100
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

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.tenants IS 'Multi-tenant companies using the platform';
COMMENT ON COLUMN public.tenants.slug IS 'URL-friendly identifier for tenant';
COMMENT ON COLUMN public.tenants.onboarding_progress IS 'Percentage of onboarding checklist completed (0-100)';
```

#### **2. Platform Roles Table**
```sql
-- migrations/00XX_create_platform_roles_table.sql

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

-- Trigger for updated_at
CREATE TRIGGER update_platform_roles_updated_at BEFORE UPDATE ON public.platform_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.platform_roles IS 'Roles for both platform admins and tenant users';
COMMENT ON COLUMN public.platform_roles.type IS 'platform: for super admins, tenant: for customer company users';
COMMENT ON COLUMN public.platform_roles.scope IS 'Scope of permissions: global, tenant, department, or self';
```

#### **3. User Roles (Many-to-Many)**
```sql
-- migrations/00XX_create_user_roles_table.sql

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
  UNIQUE(user_id, role_id, tenant_id)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX idx_user_roles_tenant_id ON public.user_roles(tenant_id);
CREATE INDEX idx_user_roles_expires_at ON public.user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- Comments
COMMENT ON TABLE public.user_roles IS 'Assigns roles to users with optional tenant and scope restrictions';
COMMENT ON COLUMN public.user_roles.tenant_id IS 'NULL for platform roles, specific tenant_id for tenant roles';
```

#### **4. Audit Logs Table**
```sql
-- migrations/00XX_create_audit_logs_table.sql

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
  method VARCHAR(10), -- GET, POST, PUT, DELETE
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
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);

-- Partitioning by month for performance (optional, for large scale)
-- This can be added later if audit logs grow large

-- Comments
COMMENT ON TABLE public.audit_logs IS 'Complete audit trail of all platform and tenant actions';
COMMENT ON COLUMN public.audit_logs.changes IS 'JSON object showing before/after state of modified fields';
```

#### **5. Feature Flags Table**
```sql
-- migrations/00XX_create_feature_flags_table.sql

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

-- Trigger for updated_at
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.feature_flags IS 'Feature flags for gradual rollouts and A/B testing';
COMMENT ON COLUMN public.feature_flags.rollout_type IS 'Strategy: global (all), percentage (X%), whitelist (specific tenants), blacklist (exclude tenants)';
```

### **Phase 2: Add tenant_id to Existing Tables**

```sql
-- migrations/00XX_add_tenant_id_to_existing_tables.sql

-- Add tenant_id to all existing tables
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.payroll_periods ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.payroll_details ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Create indexes for tenant_id on all tables
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON public.employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON public.departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant_id ON public.leave_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_tenant_id ON public.attendance_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_tenant_id ON public.payroll_periods(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_details_tenant_id ON public.payroll_details(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_tenant_id ON public.performance_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_goals_tenant_id ON public.goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON public.documents(tenant_id);

-- Update users table to track tenant association
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);
```

### **Phase 3: Row Level Security (RLS) Policies**

```sql
-- migrations/00XX_enable_rls_policies.sql

-- Enable RLS on all tenant-specific tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access data from their own tenant
CREATE POLICY tenant_isolation_employees ON public.employees
  FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    OR
    -- Platform admins can access all tenants
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_support')
    )
  );

-- Repeat for all tables (employees, departments, leave_requests, etc.)
CREATE POLICY tenant_isolation_departments ON public.departments
  FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_support')
    )
  );

-- (Repeat for all other tables: leave_requests, attendance_records, payroll_periods, etc.)

-- Tenants table: Platform admins only (plus tenant's own admin can read their tenant)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_admin_tenants ON public.tenants
  FOR ALL
  USING (
    -- Platform admins can access all
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_roles pr ON ur.role_id = pr.id
      WHERE ur.user_id = auth.uid()
      AND pr.slug IN ('super_admin', 'platform_support', 'platform_sales')
    )
    OR
    -- Company admins can read their own tenant
    (
      id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
      AND
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.platform_roles pr ON ur.role_id = pr.id
        WHERE ur.user_id = auth.uid()
        AND pr.slug = 'company_admin'
      )
    )
  );
```

### **Phase 4: Seed Default Roles**

```sql
-- migrations/00XX_seed_default_roles.sql

-- Platform Roles
INSERT INTO public.platform_roles (name, slug, type, permissions, is_system_role, scope) VALUES
  ('Super Admin', 'super_admin', 'platform', '["*"]'::jsonb, true, 'global'),
  ('Platform Support', 'platform_support', 'platform', '[
    "tenant.read", "tenant.update",
    "user.read", "user.update", "user.impersonate",
    "support_ticket.*", "audit_log.read"
  ]'::jsonb, true, 'global'),
  ('Platform Sales', 'platform_sales', 'platform', '[
    "tenant.create", "tenant.read",
    "demo.create", "analytics.read"
  ]'::jsonb, true, 'global'),
  ('Platform Developer', 'platform_developer', 'platform', '[
    "audit_log.read", "logs.read", "monitoring.read"
  ]'::jsonb, true, 'global');

-- Tenant Roles
INSERT INTO public.platform_roles (name, slug, type, permissions, is_system_role, scope) VALUES
  ('Company Admin', 'company_admin', 'tenant', '[
    "company.*", "user.*", "employee.*",
    "payroll.*", "performance.*",
    "billing.read", "settings.*"
  ]'::jsonb, true, 'tenant'),
  ('HR Manager', 'hr_manager', 'tenant', '[
    "employee.*", "leave.*", "attendance.*",
    "performance.*", "document.*"
  ]'::jsonb, true, 'tenant'),
  ('Payroll Manager', 'payroll_manager', 'tenant', '[
    "employee.read", "payroll.*", "compliance.read"
  ]'::jsonb, true, 'tenant'),
  ('Department Manager', 'department_manager', 'tenant', '[
    "employee.read", "leave.approve", "performance.*"
  ]'::jsonb, true, 'department'),
  ('Employee', 'employee', 'tenant', '[
    "profile.read", "profile.update",
    "attendance.own", "leave.own",
    "payslip.own", "performance.own"
  ]'::jsonb, true, 'self');

-- Create first super admin (update with your email)
-- This should be done via a separate secure process
-- INSERT INTO public.user_roles (user_id, role_id, tenant_id)
-- VALUES (
--   (SELECT id FROM public.users WHERE email = 'admin@yourdomain.com'),
--   (SELECT id FROM public.platform_roles WHERE slug = 'super_admin'),
--   NULL
-- );
```

---

## 📁 File Structure

```
src/
├── app/
│   ├── (platform-admin)/              # Platform admin route group
│   │   ├── layout.tsx                 # Platform admin layout
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Super Admin Dashboard
│   │   ├── tenants/
│   │   │   ├── page.tsx               # Tenant list
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create tenant wizard
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Tenant detail (tabs)
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit tenant
│   │   ├── users/
│   │   │   ├── page.tsx               # Platform users list
│   │   │   └── [id]/
│   │   │       └── page.tsx           # User detail
│   │   └── settings/
│   │       └── page.tsx               # Platform settings
│   │
│   └── api/
│       └── platform/                   # Platform API routes
│           ├── tenants/
│           │   ├── route.ts            # GET (list), POST (create)
│           │   ├── [id]/
│           │   │   ├── route.ts        # GET (detail), PATCH (update), DELETE
│           │   │   ├── users/
│           │   │   │   └── route.ts    # GET tenant users
│           │   │   └── stats/
│           │   │       └── route.ts    # GET tenant statistics
│           │   └── stats/
│           │       └── route.ts        # GET all tenants stats
│           ├── users/
│           │   ├── route.ts            # GET (list all users)
│           │   └── [id]/
│           │       ├── route.ts        # GET (detail), PATCH (update)
│           │       └── impersonate/
│           │           └── route.ts    # POST (impersonate user)
│           └── dashboard/
│               └── stats/
│                   └── route.ts        # GET platform metrics
│
├── components/
│   └── platform/                       # Platform admin components
│       ├── PlatformDashboard.tsx       # Main dashboard
│       ├── TenantListTable.tsx         # Tenant list with filters
│       ├── TenantCreationWizard.tsx    # 4-step wizard
│       ├── TenantDetailTabs.tsx        # Tabs for tenant detail
│       ├── TenantOverview.tsx          # Overview tab
│       ├── TenantUsers.tsx             # Users tab
│       ├── TenantBilling.tsx           # Billing tab (placeholder)
│       ├── TenantUsageAnalytics.tsx    # Usage tab
│       ├── TenantSettings.tsx          # Settings tab
│       ├── TenantAuditLogs.tsx         # Audit logs tab
│       ├── TenantSupport.tsx           # Support tab (placeholder)
│       ├── PlatformUserList.tsx        # Platform-wide user list
│       ├── MetricsCard.tsx             # Reusable metric widget
│       ├── RevenueChart.tsx            # Revenue trend chart
│       └── TenantGrowthChart.tsx       # Tenant growth chart
│
├── lib/
│   ├── api/
│   │   ├── types.ts                    # Add platform types
│   │   └── services/
│   │       ├── platformService.ts      # Platform stats & operations
│   │       ├── tenantService.ts        # Tenant CRUD
│   │       ├── auditLogService.ts      # Audit logging
│   │       └── rbacService.ts          # Permission checks
│   │
│   ├── hooks/
│   │   ├── usePlatformStats.ts         # Platform metrics hook
│   │   ├── useTenants.ts               # Tenants list hook
│   │   └── usePermissions.ts           # Permission check hook
│   │
│   └── utils/
│       ├── tenantContext.ts            # Tenant context provider
│       └── permissions.ts              # Permission helper functions
│
└── middleware.ts                        # Update for platform routes
```

---

## 🔧 TypeScript Types

```typescript
// lib/api/types.ts - Add to existing file

// ============================================
// PLATFORM ADMIN TYPES
// ============================================

export interface Tenant {
  id: string;
  companyName: string;
  slug: string;
  industry: string | null;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null;

  // Contact
  primaryAdminId: string | null;
  supportEmail: string | null;
  billingEmail: string | null;

  // Subscription
  subscriptionPlan: 'trial' | 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'suspended' | 'cancelled';
  trialEndsAt: string | null;
  subscriptionStartsAt: string | null;
  subscriptionEndsAt: string | null;

  // Limits
  maxEmployees: number;
  maxStorageGb: number;
  maxApiCallsPerMonth: number;

  // Usage
  currentEmployeeCount: number;
  currentStorageGb: number;
  currentApiCalls: number;

  // Billing
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;

  // White-label
  customDomain: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;

  // Location
  country: string;
  timezone: string;
  currency: string;

  // Status
  status: 'active' | 'suspended' | 'cancelled' | 'deleted';
  suspendedAt: string | null;
  suspendedReason: string | null;

  // Metadata
  onboardingCompleted: boolean;
  onboardingProgress: number;
  featureFlags: Record<string, boolean>;
  settings: Record<string, any>;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TenantWithAdmin extends Tenant {
  primaryAdmin: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface PlatformDashboardMetrics {
  tenantMetrics: {
    total: number;
    active: number;
    trial: number;
    paused: number;
    churned: number;
    newThisMonth: number;
    growthRate: number; // percentage
  };

  userMetrics: {
    totalUsers: number;
    activeUsers: number; // Last 30 days
    newUsersToday: number;
    averageUsersPerTenant: number;
  };

  revenueMetrics: {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    churnRate: number;
    averageRevenuePerTenant: number;
  };

  systemHealth: {
    uptime: number; // percentage
    apiLatency: number; // ms
    errorRate: number; // percentage
    dbConnections: number;
  };
}

export interface TenantStats {
  tenantId: string;

  users: {
    total: number;
    active: number;
    invited: number;
  };

  employees: {
    total: number;
    active: number;
    onLeave: number;
  };

  usage: {
    storageUsedGb: number;
    apiCallsThisMonth: number;
    lastActivityAt: string;
  };

  modules: {
    attendance: { enabled: boolean; usage: number };
    leave: { enabled: boolean; usage: number };
    payroll: { enabled: boolean; usage: number };
    performance: { enabled: boolean; usage: number };
  };
}

export interface PlatformRole {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'platform' | 'tenant';
  permissions: string[];
  isSystemRole: boolean;
  scope: 'global' | 'tenant' | 'department' | 'self';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  tenantId: string | null;
  scopeType: string | null;
  scopeId: string | null;
  assignedBy: string | null;
  assignedAt: string;
  expiresAt: string | null;

  // Expanded relations
  role?: PlatformRole;
  user?: User;
  tenant?: Tenant;
}

export interface AuditLog {
  id: string;
  tenantId: string | null;

  actorId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  actorIp: string | null;

  action: string;

  resourceType: string | null;
  resourceId: string | null;
  resourceName: string | null;

  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  } | null;

  userAgent: string | null;
  method: string | null;
  endpoint: string | null;

  severity: 'info' | 'warning' | 'critical';

  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rolloutType: 'global' | 'percentage' | 'whitelist' | 'blacklist';
  rolloutPercentage: number;
  tenantWhitelist: string[];
  tenantBlacklist: string[];
  enableAt: string | null;
  disableAt: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateTenantData {
  // Step 1: Company Info
  companyName: string;
  industry: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  country: string;
  timezone: string;
  currency: string;

  // Step 2: Admin User
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string | null;
  sendWelcomeEmail: boolean;

  // Step 3: Subscription
  subscriptionPlan: 'trial' | 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  maxEmployees: number;
  trialDays?: number;

  // Step 4: Initial Setup
  enabledModules: string[];
  loadSampleData: boolean;
  customDomain?: string;
  primaryColor?: string;
}

export interface UpdateTenantData {
  companyName?: string;
  industry?: string;
  companySize?: string;
  supportEmail?: string;
  billingEmail?: string;
  status?: 'active' | 'suspended' | 'cancelled';
  suspendedReason?: string;
  subscriptionPlan?: string;
  maxEmployees?: number;
  maxStorageGb?: number;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  settings?: Record<string, any>;
  featureFlags?: Record<string, boolean>;
}

export interface TenantFilters {
  status?: 'active' | 'trial' | 'suspended' | 'cancelled';
  plan?: 'trial' | 'starter' | 'professional' | 'enterprise';
  search?: string;
  sortBy?: 'createdAt' | 'companyName' | 'currentEmployeeCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PlatformUserFilters {
  tenantId?: string;
  roleSlug?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}
```

---

## 📦 Components Implementation Order

### **1. Platform Layout (Day 3)**

```tsx
// src/app/(platform-admin)/layout.tsx

import { ReactNode } from 'react';
import { PlatformSidebar } from '@/components/platform/PlatformSidebar';
import { PlatformHeader } from '@/components/platform/PlatformHeader';

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-gray-200 dark:border-gray-800">
        <PlatformSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PlatformHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### **2. Super Admin Dashboard (Days 6-7)**
- Platform metrics cards (tenants, users, revenue, health)
- Tenant growth chart (line chart)
- Revenue trend chart (line chart)
- Plan distribution (pie chart)
- Recent activity feed
- Quick actions

### **3. Tenant List (Days 8-9)**
- TanStack Table with filters
- Status badges
- Plan indicators
- Quick actions (view, suspend, edit)
- Search & filters
- Bulk actions

### **4. Tenant Creation Wizard (Day 10)**
- 4-step wizard component
- Step 1: Company Info
- Step 2: Admin User
- Step 3: Subscription
- Step 4: Initial Setup
- Progress indicator
- Form validation

### **5. Tenant Detail View (Days 11-12)**
- 7 tabs: Overview, Users, Billing, Usage, Settings, Audit Logs, Support
- Each tab as separate component
- Tab navigation
- Quick actions bar

### **6. User Management (Days 13-14)**
- Platform-wide user list
- User impersonation (with audit)
- User detail view
- Assign roles

---

## ✅ Testing Checklist

### **Database Tests**
- [ ] All tables created successfully
- [ ] Foreign keys working
- [ ] Indexes created
- [ ] RLS policies active
- [ ] Seed data inserted

### **Tenant Management**
- [ ] Create tenant successfully
- [ ] Tenant list loads with pagination
- [ ] Filters work (status, plan, search)
- [ ] Tenant detail shows all data
- [ ] Can update tenant info
- [ ] Can suspend/activate tenant
- [ ] Soft delete works

### **User Management**
- [ ] Platform-wide user list loads
- [ ] Can filter by tenant
- [ ] Can assign roles
- [ ] Impersonation works with audit trail

### **Dashboard**
- [ ] Metrics load correctly
- [ ] Charts render
- [ ] Real-time updates work
- [ ] Performance acceptable (<1s load)

### **Security**
- [ ] RLS prevents cross-tenant data access
- [ ] Platform admins can access all tenants
- [ ] Regular users cannot access platform routes
- [ ] All actions logged to audit_logs

---

## 📊 Success Metrics

- **Tenant Creation Time:** <2 minutes
- **Dashboard Load Time:** <1 second
- **Tenant List Load Time:** <500ms
- **RLS Performance:** No noticeable overhead
- **Audit Log Coverage:** 100% of critical actions

---

## 🚀 Next Steps After Sprint 13

After completing Sprint 13, we'll have:
- ✅ Multi-tenant foundation
- ✅ Platform admin dashboard
- ✅ Tenant management
- ✅ RBAC foundation

**Sprint 14 will add:**
- Billing & subscriptions (Stripe/Midtrans)
- Invoice generation
- Payment processing
- Subscription lifecycle management

---

**This sprint creates the foundation for transforming the HRIS platform into a scalable multi-tenant SaaS product! 🚀**

---

*Last Updated: 2025-11-18*
*Status: Ready for Implementation*
