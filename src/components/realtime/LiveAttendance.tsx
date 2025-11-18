/**
 * Live Attendance Component
 * Example component demonstrating realtime attendance tracking
 */

'use client';

import { useState, useCallback } from 'react';
import { useAttendanceUpdates } from '@/lib/realtime';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out?: string;
  status: string;
}

interface LiveAttendanceProps {
  companyId: string;
}

export function LiveAttendance({ companyId }: LiveAttendanceProps) {
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);

  const handleAttendanceUpdate = useCallback((payload: RealtimePostgresChangesPayload<AttendanceRecord>) => {
    if (payload.eventType === 'INSERT') {
      setRecentRecords((prev) => [payload.new, ...prev].slice(0, 10));
    } else if (payload.eventType === 'UPDATE') {
      setRecentRecords((prev) =>
        prev.map((record) =>
          record.id === payload.new.id ? payload.new : record
        )
      );
    } else if (payload.eventType === 'DELETE') {
      setRecentRecords((prev) =>
        prev.filter((record) => record.id !== payload.old.id)
      );
    }
  }, []);

  const { isConnected } = useAttendanceUpdates(companyId, handleAttendanceUpdate);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Attendance</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live Updates' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {recentRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent attendance records
          </div>
        ) : (
          recentRecords.map((record) => (
            <div
              key={record.id}
              className="bg-gray-50 p-3 rounded flex items-center justify-between"
            >
              <div>
                <div className="font-medium">Employee {record.employee_id}</div>
                <div className="text-sm text-gray-600">
                  In: {new Date(record.clock_in).toLocaleTimeString()}
                  {record.clock_out && (
                    <> | Out: {new Date(record.clock_out).toLocaleTimeString()}</>
                  )}
                </div>
              </div>
              <div
                className={`text-xs px-2 py-1 rounded ${
                  record.status === 'present'
                    ? 'bg-green-100 text-green-800'
                    : record.status === 'late'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {record.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
