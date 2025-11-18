/**
 * Recent Activity Component
 * Display recent activities in the system
 */

'use client';

import { Calendar, Clock, UserPlus, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'leave' | 'attendance' | 'employee' | 'document' | 'approval';
  title: string;
  description: string;
  timestamp: Date;
  user: {
    name: string;
    avatar?: string;
  };
  status?: 'approved' | 'rejected' | 'pending';
}

interface RecentActivityProps {
  activities?: Activity[];
  maxItems?: number;
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'leave',
    title: 'Leave Request Approved',
    description: 'Sarah submitted a leave request for Dec 25-26',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    user: { name: 'Sarah' },
    status: 'approved',
  },
  {
    id: '2',
    type: 'employee',
    title: 'New Employee Onboarded',
    description: 'John Doe joined Engineering team',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    user: { name: 'John Doe' },
  },
  {
    id: '3',
    type: 'attendance',
    title: 'Late Clock In',
    description: 'Alex clocked in at 9:30 AM (30 min late)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    user: { name: 'Alex' },
  },
  {
    id: '4',
    type: 'document',
    title: 'Document Uploaded',
    description: 'Maria uploaded employment contract',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    user: { name: 'Maria' },
  },
];

const activityIcons = {
  leave: Calendar,
  attendance: Clock,
  employee: UserPlus,
  document: FileText,
  approval: CheckCircle,
};

const statusColors = {
  approved: 'text-green-600 bg-green-50',
  rejected: 'text-red-600 bg-red-50',
  pending: 'text-yellow-600 bg-yellow-50',
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
}

export function RecentActivity({
  activities = defaultActivities,
  maxItems = 5,
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {displayActivities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-gray-100 p-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[activity.status]
                        }`}
                      >
                        {activity.status}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)} • {activity.user.name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-6 py-3 text-center border-t border-gray-200">
        <a href="/activity" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View all activity
        </a>
      </div>
    </div>
  );
}
