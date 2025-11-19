'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Spinner, Button } from '@heroui/react';
import { Clock, UserPlus, Edit, Award, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'approve' | 'reject' | 'login' | 'logout' | 'other';
  entityType: 'employee' | 'payroll' | 'leave' | 'attendance' | 'performance' | 'document' | 'department' | 'position' | 'user' | 'other';
  entityId: string | null;
  entityName: string | null;
  description: string;
  timestamp: string;
  userName: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
}

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
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        setLoading(true);
        // Fetch audit logs for this employee
        const response = await fetch(
          `/api/v1/compliance/audit-logs?entityId=${employeeId}&entityType=employee&limit=20`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch timeline');
        }

        const result = await response.json();
        const auditLogs: AuditLog[] = result.logs || [];

        // Map audit logs to timeline events
        const timelineEvents: TimelineEvent[] = auditLogs.map((log) => {
          return mapAuditLogToEvent(log);
        });

        setEvents(timelineEvents);
      } catch (err) {
        console.error('Error fetching timeline:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch timeline');
      } finally {
        setLoading(false);
      }
    }

    fetchTimeline();
  }, [employeeId]);

  // Map audit log to timeline event
  function mapAuditLogToEvent(log: AuditLog): TimelineEvent {
    let type: TimelineEvent['type'] = 'updated';
    let icon = <Edit className="w-4 h-4" />;
    let title = log.description;

    // Determine event type and icon based on action and entity type
    if (log.action === 'create') {
      type = 'created';
      icon = <UserPlus className="w-4 h-4" />;
      title = `Employee ${log.action === 'create' ? 'Created' : 'Updated'}`;
    } else if (log.entityType === 'performance') {
      type = 'performance';
      icon = <Award className="w-4 h-4" />;
      title = 'Performance Review';
    } else if (log.entityType === 'document') {
      type = 'document';
      icon = <FileText className="w-4 h-4" />;
      title = 'Document Activity';
    } else if (log.entityType === 'payroll') {
      type = 'salary_change';
      icon = <DollarSign className="w-4 h-4" />;
      title = 'Payroll Update';
    } else if (log.changes) {
      // Check if it's a promotion (position or department change)
      if ('position' in log.changes || 'department' in log.changes) {
        type = 'promotion';
        icon = <Award className="w-4 h-4" />;
        title = 'Position/Department Change';
      }
    }

    return {
      id: log.id,
      type,
      title,
      description: log.description,
      date: log.timestamp,
      icon,
    };
  }

  const iconColorMap = {
    created: 'text-blue-600',
    updated: 'text-gray-600',
    promotion: 'text-green-600',
    salary_change: 'text-purple-600',
    performance: 'text-yellow-600',
    document: 'text-orange-600',
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Spinner size="lg" color="primary" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading timeline...</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Timeline</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button color="primary" size="sm" onPress={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Timeline
        </h3>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No activity recorded yet</p>
          </div>
        ) : (
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
                      {format(new Date(event.date), 'MMM dd, yyyy • HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
