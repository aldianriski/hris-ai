/**
 * RBAC Permission System for Platform Admin
 * Defines roles, permissions, and utilities for checking access
 */

// Platform Admin Roles
export type PlatformRole =
  | 'super_admin'       // Full system access
  | 'platform_admin'    // Tenant and user management
  | 'support_admin'     // Read-only access + support features
  | 'billing_admin';    // Billing and subscription management

// Tenant Roles
export type TenantRole =
  | 'company_admin'     // Full company access
  | 'hr_admin'          // HR module access
  | 'payroll_admin'     // Payroll module access
  | 'manager'           // Team management
  | 'employee';         // Basic employee access

// All roles
export type Role = PlatformRole | TenantRole;

// Permission actions
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage';

// Resource types
export type ResourceType =
  | 'tenant'
  | 'platform_user'
  | 'subscription'
  | 'billing'
  | 'employee'
  | 'payroll'
  | 'attendance'
  | 'leave';

/**
 * Permission matrix defining what each role can do
 */
const PERMISSION_MATRIX: Record<Role, Partial<Record<ResourceType, PermissionAction[]>>> = {
  // Platform Admin Roles
  super_admin: {
    tenant: ['create', 'read', 'update', 'delete', 'manage'],
    platform_user: ['create', 'read', 'update', 'delete', 'manage'],
    subscription: ['create', 'read', 'update', 'delete', 'manage'],
    billing: ['create', 'read', 'update', 'delete', 'manage'],
  },
  platform_admin: {
    tenant: ['create', 'read', 'update', 'manage'],
    platform_user: ['create', 'read', 'update'],
    subscription: ['read', 'update'],
    billing: ['read'],
  },
  support_admin: {
    tenant: ['read'],
    platform_user: ['read'],
    subscription: ['read'],
    billing: ['read'],
  },
  billing_admin: {
    tenant: ['read'],
    subscription: ['read', 'update', 'manage'],
    billing: ['create', 'read', 'update', 'manage'],
  },

  // Tenant Roles
  company_admin: {
    employee: ['create', 'read', 'update', 'delete', 'manage'],
    payroll: ['create', 'read', 'update', 'delete', 'manage'],
    attendance: ['create', 'read', 'update', 'delete', 'manage'],
    leave: ['create', 'read', 'update', 'delete', 'manage'],
  },
  hr_admin: {
    employee: ['create', 'read', 'update', 'manage'],
    attendance: ['read', 'update', 'manage'],
    leave: ['read', 'update', 'manage'],
    payroll: ['read'],
  },
  payroll_admin: {
    employee: ['read'],
    payroll: ['create', 'read', 'update', 'manage'],
    attendance: ['read'],
  },
  manager: {
    employee: ['read'],
    attendance: ['read'],
    leave: ['read', 'update'],
    payroll: ['read'],
  },
  employee: {
    attendance: ['create', 'read'],
    leave: ['create', 'read'],
  },
};

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: Role,
  resource: ResourceType,
  action: PermissionAction
): boolean {
  const permissions = PERMISSION_MATRIX[role]?.[resource];
  if (!permissions) return false;

  // 'manage' permission grants all actions
  return permissions.includes(action) || permissions.includes('manage');
}

/**
 * Check if a role is a platform admin role
 */
export function isPlatformAdmin(role: string): role is PlatformRole {
  const platformRoles: PlatformRole[] = [
    'super_admin',
    'platform_admin',
    'support_admin',
    'billing_admin',
  ];
  return platformRoles.includes(role as PlatformRole);
}

/**
 * Check if a role is a tenant role
 */
export function isTenantRole(role: string): role is TenantRole {
  const tenantRoles: TenantRole[] = [
    'company_admin',
    'hr_admin',
    'payroll_admin',
    'manager',
    'employee',
  ];
  return tenantRoles.includes(role as TenantRole);
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    // Platform roles
    super_admin: 'Super Admin',
    platform_admin: 'Platform Admin',
    support_admin: 'Support Admin',
    billing_admin: 'Billing Admin',
    // Tenant roles
    company_admin: 'Company Admin',
    hr_admin: 'HR Admin',
    payroll_admin: 'Payroll Admin',
    manager: 'Manager',
    employee: 'Employee',
  };
  return displayNames[role] || role;
}

/**
 * Get all available permissions for a role
 */
export function getRolePermissions(role: Role): Partial<Record<ResourceType, PermissionAction[]>> {
  return PERMISSION_MATRIX[role] || {};
}
