/**
 * Platform admin permission checking utilities
 * Used in API routes for platform administration
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface PlatformUser {
  id: string;
  email: string;
  roles: string[];
}

export interface PermissionCheckResult {
  user: PlatformUser | null;
  error: string | null;
}

/**
 * Check if the current user has one of the required platform admin roles
 * @param supabase - Supabase client instance
 * @param requiredRoles - Array of role slugs that are allowed (e.g., ['super_admin', 'platform_admin'])
 * @returns Object containing user data or error message
 */
export async function checkPlatformAdminPermission(
  supabase: SupabaseClient,
  requiredRoles: string[] = ['super_admin']
): Promise<PermissionCheckResult> {
  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        user: null,
        error: 'Unauthorized - Please log in',
      };
    }

    // Get user's platform roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(
        `
        id,
        role:platform_roles!inner(slug, name, permissions)
      `
      )
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return {
        user: null,
        error: 'Failed to verify permissions',
      };
    }

    // Extract role slugs
    const roles = userRoles?.map((ur: any) => ur.role?.slug).filter(Boolean) || [];

    // Check if user has any of the required roles
    const hasRequiredRole = roles.some((role: string) => requiredRoles.includes(role));

    if (!hasRequiredRole) {
      return {
        user: null,
        error: `Forbidden - Requires one of: ${requiredRoles.join(', ')}`,
      };
    }

    // User has permission
    return {
      user: {
        id: user.id,
        email: user.email || '',
        roles,
      },
      error: null,
    };
  } catch (error) {
    console.error('Permission check error:', error);
    return {
      user: null,
      error: 'Internal server error',
    };
  }
}

/**
 * Check if the current user is a super admin
 * @param supabase - Supabase client instance
 * @returns Object containing user data or error message
 */
export async function checkSuperAdminPermission(
  supabase: SupabaseClient
): Promise<PermissionCheckResult> {
  return checkPlatformAdminPermission(supabase, ['super_admin']);
}

/**
 * Check if the current user has support role
 * @param supabase - Supabase client instance
 * @returns Object containing user data or error message
 */
export async function checkSupportPermission(
  supabase: SupabaseClient
): Promise<PermissionCheckResult> {
  return checkPlatformAdminPermission(supabase, ['super_admin', 'platform_support']);
}

/**
 * Check if the current user has any platform admin role
 * @param supabase - Supabase client instance
 * @returns boolean
 */
export async function isPlatformAdmin(supabase: SupabaseClient): Promise<boolean> {
  const result = await checkPlatformAdminPermission(supabase, [
    'super_admin',
    'platform_admin',
    'platform_support',
    'platform_sales',
  ]);
  return result.user !== null;
}
