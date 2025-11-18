'use client';

/**
 * Real-time hooks for tenant data
 * Uses Supabase subscriptions to listen for database changes
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook to listen for real-time updates to tenants table
 */
export function useRealtimeTenants(initialTenants: any[] = []) {
  const [tenants, setTenants] = useState(initialTenants);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Set up real-time subscription
    const realtimeChannel = supabase
      .channel('tenants-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'tenants',
        },
        (payload) => {
          console.log('Tenant change received:', payload);

          if (payload.eventType === 'INSERT') {
            // Add new tenant
            setTenants((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing tenant
            setTenants((prev) =>
              prev.map((tenant) =>
                tenant.id === payload.new.id ? { ...tenant, ...payload.new } : tenant
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted tenant
            setTenants((prev) => prev.filter((tenant) => tenant.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  return { tenants, setTenants, channel };
}

/**
 * Hook to listen for real-time updates to a specific tenant
 */
export function useRealtimeTenant(tenantId: string, initialTenant: any = null) {
  const [tenant, setTenant] = useState(initialTenant);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Set up real-time subscription for specific tenant
    const realtimeChannel = supabase
      .channel(`tenant-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tenants',
          filter: `id=eq.${tenantId}`,
        },
        (payload) => {
          console.log('Tenant update received:', payload);
          setTenant((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [tenantId]);

  return { tenant, setTenant, channel };
}

/**
 * Hook to listen for real-time updates to tenant users
 */
export function useRealtimeTenantUsers(tenantId: string, initialUsers: any[] = []) {
  const [users, setUsers] = useState(initialUsers);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Set up real-time subscription for tenant users
    const realtimeChannel = supabase
      .channel(`tenant-users-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_users',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log('Tenant user change received:', payload);

          if (payload.eventType === 'INSERT') {
            setUsers((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setUsers((prev) =>
              prev.map((user) =>
                user.id === payload.new.id ? { ...user, ...payload.new } : user
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setUsers((prev) => prev.filter((user) => user.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [tenantId]);

  return { users, setUsers, channel };
}

/**
 * Hook to listen for real-time updates to subscriptions
 */
export function useRealtimeSubscription(tenantId: string, initialSubscription: any = null) {
  const [subscription, setSubscription] = useState(initialSubscription);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Set up real-time subscription for tenant subscription
    const realtimeChannel = supabase
      .channel(`subscription-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log('Subscription change received:', payload);

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setSubscription(payload.new);
          }
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [tenantId]);

  return { subscription, setSubscription, channel };
}
