/**
 * Leave Request Card Component
 * Display leave request with approval actions
 */

'use client';

import { Calendar, Clock, Check, X, Info } from 'lucide-react';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeAvatar?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface LeaveRequestCardProps {
  request: LeaveRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

const leaveTypeColors = {
  'Annual Leave': 'bg-blue-100 text-blue-800',
  'Sick Leave': 'bg-red-100 text-red-800',
  'Emergency Leave': 'bg-yellow-100 text-yellow-800',
  'Unpaid Leave': 'bg-gray-100 text-gray-800',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function LeaveRequestCard({
  request,
  onApprove,
  onReject,
  showActions = true,
}: LeaveRequestCardProps) {
  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const isRejected = request.status === 'rejected';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg">
            {request.employeeName[0]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {request.employeeName}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  leaveTypeColors[request.leaveType as keyof typeof leaveTypeColors] ||
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {request.leaveType}
              </span>
              {isPending && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  Pending
                </span>
              )}
              {isApproved && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Approved
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  Rejected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>
            {formatDate(request.startDate)} - {formatDate(request.endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{request.days} day{request.days > 1 ? 's' : ''}</span>
        </div>
      </div>

      {request.reason && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700">Reason:</p>
              <p className="mt-1 text-sm text-gray-600">{request.reason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Submitted {formatDate(request.submittedAt)}
      </div>

      {showActions && isPending && (
        <div className="mt-6 flex gap-3">
          {onApprove && (
            <button
              onClick={() => onApprove(request.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              Approve
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(request.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}
