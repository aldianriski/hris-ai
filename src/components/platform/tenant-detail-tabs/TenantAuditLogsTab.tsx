'use client';

import { Card, CardBody, Chip, Input } from '@heroui/react';
import { Search, Shield, User, Settings } from 'lucide-react';

interface TenantAuditLogsTabProps {
  tenantId: string;
}

const mockAuditLogs = [
  {
    id: '1',
    action: 'user.created',
    actor: 'Budi Santoso',
    description: 'Created new user Ani Wijaya',
    timestamp: '2024-11-18T10:30:00Z',
    severity: 'info',
  },
  {
    id: '2',
    action: 'settings.updated',
    actor: 'Budi Santoso',
    description: 'Updated company settings',
    timestamp: '2024-11-17T15:45:00Z',
    severity: 'info',
  },
  {
    id: '3',
    action: 'subscription.upgraded',
    actor: 'Platform Admin',
    description: 'Subscription upgraded to Professional',
    timestamp: '2024-11-15T09:20:00Z',
    severity: 'warning',
  },
  {
    id: '4',
    action: 'user.role_changed',
    actor: 'Budi Santoso',
    description: 'Changed Rizki Pratama role to Payroll Manager',
    timestamp: '2024-11-14T14:10:00Z',
    severity: 'warning',
  },
];

const severityColors = {
  info: 'primary',
  warning: 'warning',
  critical: 'danger',
} as const;

const actionIcons = {
  user: User,
  settings: Settings,
  subscription: Shield,
};

export function TenantAuditLogsTab({ tenantId }: TenantAuditLogsTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Audit Logs
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete activity history for this tenant
        </p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search audit logs..."
        startContent={<Search className="w-4 h-4 text-gray-400" />}
        classNames={{
          input: 'text-sm',
        }}
      />

      {/* Audit Logs List */}
      <div className="space-y-3">
        {mockAuditLogs.map((log) => {
          const Icon = actionIcons[log.action.split('.')[0] as keyof typeof actionIcons] || Shield;

          return (
            <Card key={log.id}>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.description}
                      </p>
                      <Chip
                        size="sm"
                        color={severityColors[log.severity as keyof typeof severityColors]}
                        variant="flat"
                      >
                        {log.action}
                      </Chip>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span>By {log.actor}</span>
                      <span>•</span>
                      <span>
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Load More */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardBody className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing 4 of 127 audit log entries
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
