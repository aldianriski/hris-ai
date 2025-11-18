/**
 * Server-side permission utilities
 * Used in API routes and Server Components
 */

import { createClient } from '@/lib/supabase/server';
import { hasPermission, isPlatformAdmin, type Role, type ResourceType, type PermissionAction } from './permissions';

export interface UserWithRole {
  id: string;
  email: string;
  role: Role;
  tenantId?: string;
}

/**
 * Get current user with their role
 * Checks both platform_users and tenant_users tables
 */
export async function getCurrentUser(): Promise<UserWithRole | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }

  // Check if user is a platform admin
  const { data: platformUser } = await supabase
    .from('platform_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (platformUser) {
    return {
      id: user.id,
      email: user.email || '',
      role: platformUser.role as Role,
    };
  }

  // Check if user is a tenant user
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('role, tenant_id')
    .eq('user_id', user.id)
    .single();

  if (tenantUser) {
    return {
      id: user.id,
      email: user.email || '',
      role: tenantUser.role as Role,
      tenantId: tenantUser.tenant_id,
    };
  }

  return null;
}

/**
 * Check if current user has permission to perform an action
 */
export async function checkPermission(
  resource: ResourceType,
  action: PermissionAction
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  return hasPermission(user.role, resource, action);
}

/**
 * Require permission or throw error
 * Use in API routes to enforce permissions
 */
export async function requirePermission(
  resource: ResourceType,
  action: PermissionAction
): Promise<UserWithRole> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: No authenticated user');
  }

  if (!hasPermission(user.role, resource, action)) {
    throw new Error(`Forbidden: ${user.role} cannot ${action} ${resource}`);
  }

  return user;
}

/**
 * Require platform admin role
 * Use in platform admin API routes
 */
export async function requirePlatformAdmin(): Promise<UserWithRole> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: No authenticated user');
  }

  if (!isPlatformAdmin(user.role)) {
    throw new Error('Forbidden: Platform admin access required');
  }

  return user;
}

/**
 * Get tenant ID for current user
 * Only works for tenant users
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.tenantId || null;
}
