/**
 * Authentication Middleware
 * Handles JWT token verification and user context extraction
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UserContext } from '../api/types';
import { unauthorizedResponse, forbiddenResponse } from '../api/response';

/**
 * Get user context from request
 * Verifies Supabase JWT token and extracts user information
 */
export async function getUserContext(
  request: NextRequest
): Promise<UserContext | null> {
  try {
    const supabase = await createClient();
    
    // Get the user from the session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Get user metadata from user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, employee_id, company_id, department_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      // If user doesn't exist in users table, return basic context
      return {
        id: user.id,
        email: user.email || '',
        role: 'employee',
        companyId: '',
      };
    }

    return {
      id: user.id,
      email: user.email || '',
      role: userData.role || 'employee',
      employeeId: userData.employee_id,
      companyId: userData.company_id,
      departmentId: userData.department_id,
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
}

/**
 * Require authentication middleware
 * Returns user context or throws 401 error
 */
export async function requireAuth(
  request: NextRequest
): Promise<UserContext> {
  const userContext = await getUserContext(request);

  if (!userContext) {
    throw unauthorizedResponse('Authentication required');
  }

  return userContext;
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserContext['role'][]
): Promise<UserContext> {
  const userContext = await requireAuth(request);

  if (!allowedRoles.includes(userContext.role)) {
    throw forbiddenResponse('Insufficient permissions');
  }

  return userContext;
}

/**
 * Require HR role (hr or admin or platform_admin)
 */
export async function requireHR(request: NextRequest): Promise<UserContext> {
  return requireRole(request, ['hr', 'admin', 'platform_admin']);
}

/**
 * Require Manager role (manager or hr or admin or platform_admin)
 */
export async function requireManager(request: NextRequest): Promise<UserContext> {
  return requireRole(request, ['manager', 'hr', 'admin', 'platform_admin']);
}

/**
 * Require Admin role (admin or platform_admin)
 */
export async function requireAdmin(request: NextRequest): Promise<UserContext> {
  return requireRole(request, ['admin', 'platform_admin']);
}

/**
 * Require Platform Admin role
 */
export async function requirePlatformAdmin(request: NextRequest): Promise<UserContext> {
  return requireRole(request, ['platform_admin']);
}

/**
 * Check if user belongs to the same company
 */
export function checkCompanyAccess(
  userContext: UserContext,
  companyId: string
): boolean {
  // Platform admins can access any company
  if (userContext.role === 'platform_admin') {
    return true;
  }

  return userContext.companyId === companyId;
}

/**
 * Check if user can access employee data
 */
export function checkEmployeeAccess(
  userContext: UserContext,
  employeeId: string
): boolean {
  // Platform admins and HR can access any employee in their company
  if (['platform_admin', 'admin', 'hr'].includes(userContext.role)) {
    return true;
  }

  // Employees can access their own data
  if (userContext.employeeId === employeeId) {
    return true;
  }

  // Managers can access their direct reports (TODO: implement hierarchy check)
  if (userContext.role === 'manager') {
    // This would require a database query to check reporting hierarchy
    return true; // Placeholder - implement later
  }

  return false;
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}
