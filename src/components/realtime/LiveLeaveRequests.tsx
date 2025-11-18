/**
 * Live Leave Requests Component
 * Example component demonstrating realtime leave request updates
 */

'use client';

import { useState, useCallback } from 'react';
import { useLeaveRequestUpdates } from '@/lib/realtime';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

interface LiveLeaveRequestsProps {
  companyId: string;
}

export function LiveLeaveRequests({ companyId }: LiveLeaveRequestsProps) {
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const handleLeaveUpdate = useCallback((payload: RealtimePostgresChangesPayload<LeaveRequest>) => {
    if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
      setPendingRequests((prev) => [payload.new, ...prev]);
      showNotification(`New leave request from employee ${payload.new.employee_id}`);
    } else if (payload.eventType === 'UPDATE') {
      const oldStatus = payload.old?.status;
      const newStatus = payload.new.status;

      if (newStatus === 'pending') {
        setPendingRequests((prev) =>
          prev.some((r) => r.id === payload.new.id)
            ? prev.map((r) => (r.id === payload.new.id ? payload.new : r))
            : [payload.new, ...prev]
        );
      } else if (oldStatus === 'pending' && newStatus !== 'pending') {
        setPendingRequests((prev) => prev.filter((r) => r.id !== payload.new.id));
        showNotification(`Leave request ${newStatus}`);
      }
    } else if (payload.eventType === 'DELETE') {
      setPendingRequests((prev) => prev.filter((r) => r.id !== payload.old.id));
    }
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const { isConnected } = useLeaveRequestUpdates(companyId, handleLeaveUpdate);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {notification && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded animate-fade-in">
          {notification}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pending Leave Requests</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending leave requests
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div
              key={request.id}
              className="bg-yellow-50 border border-yellow-200 p-3 rounded space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Employee {request.employee_id}</div>
                  <div className="text-sm text-gray-600">
                    {request.leave_type}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(request.start_date).toLocaleDateString()} -{' '}
                {new Date(request.end_date).toLocaleDateString()}
              </div>
              {request.reason && (
                <div className="text-sm text-gray-600 italic">
                  "{request.reason}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
