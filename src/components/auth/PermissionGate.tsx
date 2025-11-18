'use client';

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 */

import { ReactNode } from 'react';
import { usePermission, useIsPlatformAdmin } from '@/lib/auth/use-permissions';
import type { ResourceType, PermissionAction } from '@/lib/auth/permissions';

interface PermissionGateProps {
  children: ReactNode;
  resource: ResourceType;
  action: PermissionAction;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Renders children only if user has permission
 */
export function PermissionGate({
  children,
  resource,
  action,
  fallback = null,
  loadingFallback = null,
}: PermissionGateProps) {
  const { hasAccess, loading } = usePermission(resource, action);

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PlatformAdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Renders children only if user is a platform admin
 */
export function PlatformAdminGate({
  children,
  fallback = null,
  loadingFallback = null,
}: PlatformAdminGateProps) {
  const { isAdmin, loading } = useIsPlatformAdmin();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
