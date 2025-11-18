'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Chip, Input, Button, Spinner, Select, SelectItem } from '@heroui/react';
import {
  Search,
  Shield,
  User,
  Settings,
  AlertCircle,
  CreditCard,
  Database,
  Activity,
} from 'lucide-react';

interface TenantAuditLogsTabProps {
  tenantId: string;
}

const severityColors = {
  info: 'primary',
  warning: 'warning',
  critical: 'danger',
} as const;

const actionIcons: Record<string, any> = {
  user: User,
  tenant: Shield,
  settings: Settings,
  subscription: CreditCard,
  data: Database,
  default: Activity,
};

const severityOptions = [
  { value: '', label: 'All Severities' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
];

export function TenantAuditLogsTab({ tenantId }: TenantAuditLogsTabProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchLogs(true);
  }, [tenantId, searchQuery, severityFilter]);

  const fetchLogs = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setLogs([]);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (severityFilter) params.append('severity', severityFilter);
      params.append('limit', pagination.limit.toString());
      params.append('offset', reset ? '0' : pagination.offset.toString());

      const response = await fetch(`/api/platform/tenants/${tenantId}/audit-logs?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const result = await response.json();

      if (reset) {
        setLogs(result.data || []);
      } else {
        setLogs((prev) => [...prev, ...(result.data || [])]);
      }

      setPagination(result.pagination || { total: 0, limit: 20, offset: 0, hasMore: false });
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
    fetchLogs(false);
  };

  const getActionIcon = (action: string) => {
    const category = action.split('.')[0];
    return actionIcons[category] || actionIcons.default;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionDescription = (log: any) => {
    // Try to construct a readable description
    if (log.resource_name) {
      return `${log.action.replace(/\./g, ' ')} - ${log.resource_name}`;
    }
    return log.action.replace(/\./g, ' ').replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Audit Logs
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete activity history for this tenant ({pagination.total} total entries)
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Search audit logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          classNames={{
            input: 'text-sm',
          }}
        />

        <Select
          label="Severity"
          selectedKeys={[severityFilter]}
          onChange={(e) => setSeverityFilter(e.target.value)}
          size="sm"
          classNames={{
            trigger: 'h-10',
          }}
        >
          {severityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Audit Logs List */}
      {logs.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No audit logs found
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Activity logs will appear here as actions are performed
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => {
              const Icon = getActionIcon(log.action);

              return (
                <Card key={log.id}>
                  <CardBody>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {getActionDescription(log)}
                          </p>
                          <Chip
                            size="sm"
                            color={severityColors[log.severity as keyof typeof severityColors] || 'default'}
                            variant="flat"
                          >
                            {log.action}
                          </Chip>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                          {log.actor?.full_name && (
                            <>
                              <span>By {log.actor.full_name}</span>
                              <span>•</span>
                            </>
                          )}
                          {log.actor_email && !log.actor && (
                            <>
                              <span>By {log.actor_email}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{formatTimestamp(log.created_at)}</span>
                          {log.actor_ip && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-xs">{log.actor_ip}</span>
                            </>
                          )}
                        </div>

                        {/* Show changes if available */}
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                              View changes
                            </summary>
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Load More */}
          {pagination.hasMore && (
            <div className="flex justify-center">
              <Button
                variant="flat"
                onPress={handleLoadMore}
                isLoading={loadingMore}
              >
                Load More
              </Button>
            </div>
          )}

          {/* Summary */}
          <Card className="bg-gray-50 dark:bg-gray-800">
            <CardBody className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {logs.length} of {pagination.total} audit log entries
              </p>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
