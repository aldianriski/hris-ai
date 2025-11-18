'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Spinner } from '@heroui/react';
import { Users, Database, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@heroui/react';

interface TenantUsageTabProps {
  tenantId: string;
}

export function TenantUsageTab({ tenantId }: TenantUsageTabProps) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenant();
  }, [tenantId]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/platform/tenants/${tenantId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tenant');
      }

      const result = await response.json();
      setTenant(result.tenant);
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tenant');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return (current / max) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error || 'Tenant not found'}</p>
        </div>
        <Button size="sm" variant="flat" onPress={fetchTenant}>
          Retry
        </Button>
      </div>
    );
  }

  const usageData = {
    employees: {
      current: tenant.current_employee_count || 0,
      max: tenant.max_employees || 0,
    },
    storage: {
      current: tenant.current_storage_gb || 0,
      max: tenant.max_storage_gb || 0,
    },
    apiCalls: {
      current: tenant.current_api_calls || 0,
      max: tenant.max_api_calls_per_month || 0,
    },
  };

  const employeePercentage = calculatePercentage(usageData.employees.current, usageData.employees.max);
  const storagePercentage = calculatePercentage(usageData.storage.current, usageData.storage.max);
  const apiPercentage = calculatePercentage(usageData.apiCalls.current, usageData.apiCalls.max);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Resource Usage
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Current usage against plan limits
        </p>
      </div>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Employees */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usageData.employees.current}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                of {usageData.employees.max}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${getUsageColor(employeePercentage)} rounded-full h-2 transition-all`}
                style={{ width: `${Math.min(employeePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {employeePercentage.toFixed(1)}% used
            </p>
            {employeePercentage >= 90 && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Approaching limit
              </p>
            )}
          </CardBody>
        </Card>

        {/* Storage */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Storage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usageData.storage.current.toFixed(2)} GB
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                of {usageData.storage.max} GB
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${getUsageColor(storagePercentage)} rounded-full h-2 transition-all`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {storagePercentage.toFixed(1)}% used
            </p>
            {storagePercentage >= 90 && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Approaching limit
              </p>
            )}
          </CardBody>
        </Card>

        {/* API Calls */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">API Calls (Monthly)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usageData.apiCalls.current.toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                of {usageData.apiCalls.max.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${getUsageColor(apiPercentage)} rounded-full h-2 transition-all`}
                style={{ width: `${Math.min(apiPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {apiPercentage.toFixed(1)}% used
            </p>
            {apiPercentage >= 90 && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Approaching limit
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Usage Summary */}
      <Card className={
        employeePercentage >= 90 || storagePercentage >= 90 || apiPercentage >= 90
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-blue-50 dark:bg-blue-900/20'
      }>
        <CardBody>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Usage Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Resources</span>
              <span className="font-medium text-gray-900 dark:text-white">3 monitored</span>
            </div>
            {(employeePercentage >= 90 || storagePercentage >= 90 || apiPercentage >= 90) && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg mt-3">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  ⚠️ Warning: One or more resources are approaching their limits
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  Consider upgrading the plan or adjusting resource limits to avoid service interruption
                </p>
              </div>
            )}
            {employeePercentage < 50 && storagePercentage < 50 && apiPercentage < 50 && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg mt-3">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ All resources are well within limits
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Module Usage - Placeholder */}
      <Card>
        <CardBody>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Module Usage Analytics
          </h4>

          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Detailed module usage analytics coming soon
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              This will show usage patterns across different HRIS modules
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
