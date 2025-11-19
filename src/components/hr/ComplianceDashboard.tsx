'use client';

import { Card, CardBody, Chip, Spinner, Button } from '@heroui/react';
import { AlertCircle, FileText, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useComplianceAlerts, useResolveAlert, useAuditLogs } from '@/lib/hooks/useCompliance';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_COLOR_MAP = {
  critical: 'danger',
  warning: 'warning',
  info: 'primary',
} as const;

export function ComplianceDashboard() {
  const { employerId } = useAuth();
  const { data: alertsData, isLoading: alertsLoading } = useComplianceAlerts(employerId, { status: 'active' });
  const { data: logsData, isLoading: logsLoading } = useAuditLogs(employerId);
  const resolveAlert = useResolveAlert();

  if (alertsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading compliance alerts..." />
      </div>
    );
  }

  const alerts = alertsData?.alerts || [];
  const auditLogs = logsData?.logs?.slice(0, 5) || [];

  const summary = {
    totalAlerts: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    warnings: alerts.filter((a) => a.severity === 'warning').length,
  };

  const handleResolveAlert = async (alertId: string) => {
    await resolveAlert.mutateAsync({ alertId });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardBody className="text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{summary.critical}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Critical Alerts</p>
          </CardBody>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardBody className="text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{summary.warnings}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Warnings</p>
          </CardBody>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardBody className="text-center">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{summary.totalAlerts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
          </CardBody>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Compliance Alerts</h3>
            <Chip size="sm" variant="flat" color="success">
              Auto-refreshes every minute
            </Chip>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <p className="text-gray-500">No compliance alerts at the moment</p>
              <p className="text-sm text-gray-400 mt-2">All compliance checks passed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <AlertCircle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      alert.severity === 'critical'
                        ? 'text-red-600'
                        : alert.severity === 'warning'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{alert.title}</h4>
                      <Chip
                        size="sm"
                        color={SEVERITY_COLOR_MAP[alert.severity]}
                        variant="flat"
                      >
                        {alert.severity}
                      </Chip>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      {alert.dueDate && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Due: {new Date(alert.dueDate).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      {alert.autoGenerated && (
                        <Chip size="sm" variant="flat" color="secondary">
                          Auto-generated
                        </Chip>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<CheckCircle className="w-4 h-4" />}
                      onPress={() => handleResolveAlert(alert.id)}
                      isLoading={resolveAlert.isPending}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Audit Log Preview */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Audit Log
          </h3>
          {logsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recent audit logs
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                >
                  <div>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-gray-500 ml-2">by {log.userName}</span>
                  </div>
                  <span className="text-gray-400">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
