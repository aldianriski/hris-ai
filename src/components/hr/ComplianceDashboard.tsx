'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { AlertCircle, FileText, Shield, Clock } from 'lucide-react';

interface ComplianceAlert {
  id: string;
  type: 'contract_expiry' | 'bpjs_overdue' | 'overtime_limit' | 'document_missing';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  employeeName?: string;
  dueDate?: string;
}

const SEVERITY_COLOR_MAP = {
  critical: 'danger',
  warning: 'warning',
  info: 'primary',
} as const;

export function ComplianceDashboard() {
  // Mock data - TODO: fetch from API
  const alerts: ComplianceAlert[] = [
    {
      id: '1',
      type: 'contract_expiry',
      severity: 'critical',
      title: 'Contract Expiring Soon',
      description: '3 employees have contracts expiring in the next 30 days',
      dueDate: '2024-12-15',
    },
    {
      id: '2',
      type: 'bpjs_overdue',
      severity: 'warning',
      title: 'BPJS Registration Overdue',
      description: '2 new employees need BPJS registration',
    },
    {
      id: '3',
      type: 'overtime_limit',
      severity: 'warning',
      title: 'Overtime Limit Approaching',
      description: '5 employees approaching monthly overtime limit',
    },
    {
      id: '4',
      type: 'document_missing',
      severity: 'info',
      title: 'Documents Missing',
      description: '8 employees have missing or expired documents',
    },
  ];

  const summary = {
    totalAlerts: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    warnings: alerts.filter((a) => a.severity === 'warning').length,
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
          <h3 className="text-lg font-semibold mb-4">Compliance Alerts</h3>
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
                    {alert.description}
                  </p>
                  {alert.dueDate && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Due: {alert.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Audit Log Preview */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Audit Log
          </h3>
          <div className="space-y-2 text-sm">
            {[
              { action: 'Employee Created', user: 'Admin', time: '2 hours ago' },
              { action: 'Payroll Approved', user: 'HR Manager', time: '5 hours ago' },
              { action: 'Contract Updated', user: 'Admin', time: '1 day ago' },
            ].map((log, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
              >
                <div>
                  <span className="font-medium">{log.action}</span>
                  <span className="text-gray-500 ml-2">by {log.user}</span>
                </div>
                <span className="text-gray-400">{log.time}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
