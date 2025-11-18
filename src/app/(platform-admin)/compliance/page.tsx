'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Chip,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Building2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ComplianceAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  tenant_id: string;
  tenant_name: string;
  affected_resource_type: string;
  affected_resource_id: string | null;
  affected_count: number;
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
  metadata: any;
}

interface AlertSummary {
  total: number;
  open: number;
  critical: number;
  warning: number;
  info: number;
  bySeverity: {
    critical: number;
    warning: number;
    info: number;
  };
}

export default function CompliancePage() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'critical'>('open');

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filter === 'open') {
        params.append('status', 'open');
      } else if (filter === 'critical') {
        params.append('severity', 'critical');
        params.append('status', 'open');
      }

      const response = await fetch(`/api/platform/compliance-alerts?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch compliance alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching compliance alerts:', error);
      toast.error('Failed to load compliance alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const response = await fetch(`/api/platform/compliance-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'acknowledged' }),
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }

      toast.success('Alert acknowledged');
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      const response = await fetch(`/api/platform/compliance-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          resolutionNotes: 'Resolved via compliance dashboard',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve alert');
      }

      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const handleDismiss = async (alertId: string) => {
    if (!confirm('Are you sure you want to dismiss this alert?')) {
      return;
    }

    try {
      const response = await fetch(`/api/platform/compliance-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss alert');
      }

      toast.success('Alert dismissed');
      fetchAlerts();
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast.error('Failed to dismiss alert');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'danger';
      case 'acknowledged':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'dismissed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Compliance Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Platform-wide compliance monitoring and proactive issue detection
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('all')}>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Alerts</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-red-50 dark:bg-red-900/20" onClick={() => setFilter('critical')}>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">Critical</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                    {summary.bySeverity.critical}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-900/20">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Warnings</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">
                    {summary.bySeverity.warning}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-blue-50 dark:bg-blue-900/20" onClick={() => setFilter('open')}>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Open</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                    {summary.open}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'solid' : 'flat'}
          color={filter === 'all' ? 'primary' : 'default'}
          onPress={() => setFilter('all')}
        >
          All Alerts
        </Button>
        <Button
          size="sm"
          variant={filter === 'open' ? 'solid' : 'flat'}
          color={filter === 'open' ? 'primary' : 'default'}
          onPress={() => setFilter('open')}
        >
          Open Only
        </Button>
        <Button
          size="sm"
          variant={filter === 'critical' ? 'solid' : 'flat'}
          color={filter === 'critical' ? 'danger' : 'default'}
          onPress={() => setFilter('critical')}
        >
          Critical Only
        </Button>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Compliance alerts table">
            <TableHeader>
              <TableColumn>SEVERITY</TableColumn>
              <TableColumn>ALERT</TableColumn>
              <TableColumn>TENANT</TableColumn>
              <TableColumn>AFFECTED</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No compliance alerts found">
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={getSeverityColor(alert.severity) as any}
                      variant="flat"
                      startContent={getSeverityIcon(alert.severity)}
                    >
                      {alert.severity}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </p>
                      {alert.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {alert.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {alert.tenant_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {alert.affected_count} {alert.affected_resource_type || 'items'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={getStatusColor(alert.status) as any}
                      variant="flat"
                    >
                      {alert.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Alert actions">
                        {alert.status === 'open' ? (
                          <>
                            <DropdownItem
                              key="acknowledge"
                              startContent={<Clock className="w-4 h-4" />}
                              onPress={() => handleAcknowledge(alert.id)}
                            >
                              Acknowledge
                            </DropdownItem>
                            <DropdownItem
                              key="resolve"
                              startContent={<CheckCircle2 className="w-4 h-4" />}
                              onPress={() => handleResolve(alert.id)}
                            >
                              Resolve
                            </DropdownItem>
                          </>
                        ) : null}
                        <DropdownItem
                          key="dismiss"
                          className="text-danger"
                          color="danger"
                          startContent={<XCircle className="w-4 h-4" />}
                          onPress={() => handleDismiss(alert.id)}
                        >
                          Dismiss
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardBody>
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Compliance Monitoring
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This dashboard monitors compliance issues across all tenants. Alerts are automatically
            detected based on platform rules and can be acknowledged, resolved, or dismissed by
            platform administrators.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
