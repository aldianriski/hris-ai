'use client';

/**
 * ⚠️ BACKEND API REQUIRED - Sprint 2
 *
 * This component currently uses mock data because there is no backend API endpoint
 * for employee timeline/audit log events.
 *
 * Required API: GET /api/v1/employees/{employeeId}/timeline or /api/v1/audit-logs
 *
 * Expected response format:
 * {
 *   data: [{
 *     id: string;
 *     event_type: 'created' | 'updated' | 'promotion' | 'salary_change' | 'performance' | 'document';
 *     title: string;
 *     description: string;
 *     created_at: string;
 *     metadata?: object;
 *   }]
 * }
 *
 * Once the API is implemented, replace mock data with:
 * - useEffect hook to fetch data
 * - Loading and error states
 * - Real-time data display
 */

import { Card, CardBody } from '@heroui/react';
import { Clock, UserPlus, Edit, Award, DollarSign, FileText } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'promotion' | 'salary_change' | 'performance' | 'document';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
}

interface EmployeeTimelineProps {
  employeeId: string;
}

export function EmployeeTimeline({ employeeId }: EmployeeTimelineProps) {
  // MOCK DATA - Replace with API call when backend is ready
  // See documentation comment at top of file for details
  const events: TimelineEvent[] = [
    {
      id: '1',
      type: 'created',
      title: 'Employee Created',
      description: 'Added to the system',
      date: '2024-01-15',
      icon: <UserPlus className="w-4 h-4" />,
    },
    {
      id: '2',
      type: 'document',
      title: 'Documents Uploaded',
      description: 'KTP and NPWP uploaded',
      date: '2024-01-16',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: '3',
      type: 'promotion',
      title: 'Promotion',
      description: 'Promoted to Senior Developer',
      date: '2024-06-01',
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: '4',
      type: 'salary_change',
      title: 'Salary Adjustment',
      description: 'Salary increased by 15%',
      date: '2024-06-01',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      id: '5',
      type: 'performance',
      title: 'Performance Review',
      description: 'Q2 2024 - Exceeds Expectations',
      date: '2024-07-15',
      icon: <Award className="w-4 h-4" />,
    },
  ];

  const iconColorMap = {
    created: 'text-blue-600',
    updated: 'text-gray-600',
    promotion: 'text-green-600',
    salary_change: 'text-purple-600',
    performance: 'text-yellow-600',
    document: 'text-orange-600',
  };

  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Timeline
        </h3>

        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index !== events.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              )}

              {/* Event */}
              <div className="flex gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 ${iconColorMap[event.type]}`}
                >
                  {event.icon}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {event.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
