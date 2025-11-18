'use client';

/**
 * Client-side permission hooks
 * Used in Client Components
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { hasPermission, isPlatformAdmin, type Role, type ResourceType, type PermissionAction } from './permissions';

export interface UserWithRole {
  id: string;
  email: string;
  role: Role;
  tenantId?: string;
}

/**
 * Hook to get current user with role
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Check if user is a platform admin
      const { data: platformUser } = await supabase
        .from('platform_users')
        .select('role')
        .eq('user_id', authUser.id)
        .single();

      if (platformUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          role: platformUser.role as Role,
        });
        setLoading(false);
        return;
      }

      // Check if user is a tenant user
      const { data: tenantUser } = await supabase
        .from('tenant_users')
        .select('role, tenant_id')
        .eq('user_id', authUser.id)
        .single();

      if (tenantUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          role: tenantUser.role as Role,
          tenantId: tenantUser.tenant_id,
        });
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  return { user, loading };
}

/**
 * Hook to check if user has permission
 */
export function usePermission(resource: ResourceType, action: PermissionAction) {
  const { user, loading } = useCurrentUser();

  const hasAccess = user ? hasPermission(user.role, resource, action) : false;

  return { hasAccess, loading, user };
}

/**
 * Hook to check if user is platform admin
 */
export function useIsPlatformAdmin() {
  const { user, loading } = useCurrentUser();

  const isAdmin = user ? isPlatformAdmin(user.role) : false;

  return { isAdmin, loading, user };
}
