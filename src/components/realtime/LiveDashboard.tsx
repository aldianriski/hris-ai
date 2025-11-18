/**
 * Live Dashboard Component
 * Example component demonstrating realtime dashboard updates
 */

'use client';

import { useState, useCallback } from 'react';
import { useDashboardRealtime } from '@/lib/realtime';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface LiveDashboardProps {
  companyId: string;
}

export function LiveDashboard({ companyId }: LiveDashboardProps) {
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Handle attendance updates
  const handleAttendanceUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log('[LiveDashboard] Attendance update:', payload);
    setLastUpdate(new Date());

    if (payload.eventType === 'INSERT') {
      setAttendanceCount((prev) => prev + 1);
    } else if (payload.eventType === 'DELETE') {
      setAttendanceCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // Handle leave request updates
  const handleLeaveUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    console.log('[LiveDashboard] Leave update:', payload);
    setLastUpdate(new Date());

    if (payload.eventType === 'INSERT' && payload.new?.status === 'pending') {
      setPendingLeaves((prev) => prev + 1);
    } else if (payload.eventType === 'UPDATE') {
      const oldStatus = payload.old?.status;
      const newStatus = payload.new?.status;

      if (oldStatus !== 'pending' && newStatus === 'pending') {
        setPendingLeaves((prev) => prev + 1);
      } else if (oldStatus === 'pending' && newStatus !== 'pending') {
        setPendingLeaves((prev) => Math.max(0, prev - 1));
      }
    } else if (payload.eventType === 'DELETE' && payload.old?.status === 'pending') {
      setPendingLeaves((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // Subscribe to realtime updates
  const { isConnected, connections } = useDashboardRealtime(
    companyId,
    {
      onAttendance: handleAttendanceUpdate,
      onLeave: handleLeaveUpdate,
    }
  );

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Dashboard</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded">
          <div className="text-sm text-gray-600">Attendance Today</div>
          <div className="text-2xl font-bold">{attendanceCount}</div>
          <div className="text-xs text-gray-500 mt-1">
            {connections.attendance ? '🟢 Live' : '⚪ Offline'}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <div className="text-sm text-gray-600">Pending Leaves</div>
          <div className="text-2xl font-bold">{pendingLeaves}</div>
          <div className="text-xs text-gray-500 mt-1">
            {connections.leave ? '🟢 Live' : '⚪ Offline'}
          </div>
        </div>
      </div>

      {lastUpdate && (
        <div className="text-xs text-gray-500 text-center">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
