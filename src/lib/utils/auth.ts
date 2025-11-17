import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

/**
 * Get current user session (server-side)
 * Cached for performance
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

/**
 * Get current user profile with employer and employee data
 */
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, employer:employers(*), employee:employees(*)')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile;
});

/**
 * Check if current user has admin role
 */
export const isAdmin = cache(async () => {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin';
});

/**
 * Check if current user is HR manager or admin
 */
export const isHRManagerOrAdmin = cache(async () => {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin' || profile?.role === 'hr_manager';
});

/**
 * Check if current user has manager role
 */
export const isManager = cache(async () => {
  const profile = await getCurrentProfile();
  return (
    profile?.role === 'admin' ||
    profile?.role === 'hr_manager' ||
    profile?.role === 'manager'
  );
});

/**
 * Get employer ID for current user
 */
export const getEmployerId = cache(async () => {
  const profile = await getCurrentProfile();
  return profile?.employer_id ?? null;
});

/**
 * Get employee ID for current user
 */
export const getEmployeeId = cache(async () => {
  const profile = await getCurrentProfile();
  return profile?.employee_id ?? null;
});

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require specific role (throws if not authorized)
 */
export async function requireRole(
  allowedRoles: Array<'admin' | 'hr_manager' | 'manager' | 'employee'>
) {
  const profile = await getCurrentProfile();

  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new Error('Forbidden');
  }

  return profile;
}
