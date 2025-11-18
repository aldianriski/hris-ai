/**
 * React Hooks for Realtime Subscriptions
 * Provides easy-to-use hooks for common realtime use cases
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  subscribeToTable,
  unsubscribe,
  type RealtimeEventType,
  type SubscriptionCallback,
} from './client';

/**
 * Hook to subscribe to table changes
 */
export function useRealtimeTable<T = any>(
  table: string,
  event: RealtimeEventType,
  callback: SubscriptionCallback<T>,
  filter?: { column: string; value: string },
  enabled: boolean = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Subscribe to table changes
    const channel = subscribeToTable<T>(table, event, (payload) => {
      setIsConnected(true);
      callback(payload);
    }, filter);

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channel) {
        const channelName = (channel as any).topic;
        unsubscribe(channelName);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [table, event, filter?.column, filter?.value, enabled]);

  return { isConnected };
}

/**
 * Hook to subscribe to attendance updates for a company
 */
export function useAttendanceUpdates(
  companyId: string,
  onUpdate: (data: any) => void,
  enabled: boolean = true
) {
  return useRealtimeTable(
    'attendance_records',
    '*',
    (payload) => {
      onUpdate(payload);
    },
    { column: 'employer_id', value: companyId },
    enabled
  );
}

/**
 * Hook to subscribe to leave request updates for a company
 */
export function useLeaveRequestUpdates(
  companyId: string,
  onUpdate: (data: any) => void,
  enabled: boolean = true
) {
  return useRealtimeTable(
    'leave_requests',
    '*',
    (payload) => {
      onUpdate(payload);
    },
    { column: 'employer_id', value: companyId },
    enabled
  );
}

/**
 * Hook to subscribe to employee updates for a company
 */
export function useEmployeeUpdates(
  companyId: string,
  onUpdate: (data: any) => void,
  enabled: boolean = true
) {
  return useRealtimeTable(
    'employees',
    '*',
    (payload) => {
      onUpdate(payload);
    },
    { column: 'employer_id', value: companyId },
    enabled
  );
}

/**
 * Hook to subscribe to payroll period updates for a company
 */
export function usePayrollUpdates(
  companyId: string,
  onUpdate: (data: any) => void,
  enabled: boolean = true
) {
  return useRealtimeTable(
    'payroll_periods',
    '*',
    (payload) => {
      onUpdate(payload);
    },
    { column: 'employer_id', value: companyId },
    enabled
  );
}

/**
 * Hook to subscribe to performance review updates for a company
 */
export function usePerformanceReviewUpdates(
  companyId: string,
  onUpdate: (data: any) => void,
  enabled: boolean = true
) {
  return useRealtimeTable(
    'performance_reviews',
    '*',
    (payload) => {
      onUpdate(payload);
    },
    { column: 'employer_id', value: companyId },
    enabled
  );
}

/**
 * Hook to subscribe to document updates for a company
 */
export function useDocumentUpdates(
  companyId: string,
  onUpdate: (data: any) => void,
  enabled: boolean = true
) {
  return useRealtimeTable(
    'documents',
    '*',
    (payload) => {
      onUpdate(payload);
    },
    { column: 'employer_id', value: companyId },
    enabled
  );
}

/**
 * Hook for dashboard realtime updates
 * Combines multiple subscriptions for a comprehensive dashboard view
 */
export function useDashboardRealtime(
  companyId: string,
  callbacks: {
    onAttendance?: (data: any) => void;
    onLeave?: (data: any) => void;
    onEmployee?: (data: any) => void;
    onPayroll?: (data: any) => void;
  },
  enabled: boolean = true
) {
  const { isConnected: attendanceConnected } = useAttendanceUpdates(
    companyId,
    callbacks.onAttendance || (() => {}),
    enabled && !!callbacks.onAttendance
  );

  const { isConnected: leaveConnected } = useLeaveRequestUpdates(
    companyId,
    callbacks.onLeave || (() => {}),
    enabled && !!callbacks.onLeave
  );

  const { isConnected: employeeConnected } = useEmployeeUpdates(
    companyId,
    callbacks.onEmployee || (() => {}),
    enabled && !!callbacks.onEmployee
  );

  const { isConnected: payrollConnected } = usePayrollUpdates(
    companyId,
    callbacks.onPayroll || (() => {}),
    enabled && !!callbacks.onPayroll
  );

  const isFullyConnected =
    (!callbacks.onAttendance || attendanceConnected) &&
    (!callbacks.onLeave || leaveConnected) &&
    (!callbacks.onEmployee || employeeConnected) &&
    (!callbacks.onPayroll || payrollConnected);

  return {
    isConnected: isFullyConnected,
    connections: {
      attendance: attendanceConnected,
      leave: leaveConnected,
      employee: employeeConnected,
      payroll: payrollConnected,
    },
  };
}
