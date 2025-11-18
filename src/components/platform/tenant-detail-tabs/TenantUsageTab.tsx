'use client';

import { Card, CardBody } from '@heroui/react';
import { Users, Database, Zap, TrendingUp } from 'lucide-react';

interface TenantUsageTabProps {
  tenant: any;
}

export function TenantUsageTab({ tenant }: TenantUsageTabProps) {
  const usageData = {
    employees: { current: tenant.currentEmployeeCount, max: tenant.maxEmployees },
    storage: { current: 2.5, max: 50 },
    apiCalls: { current: 12500, max: 50000 },
    activeUsers: { current: 38, max: tenant.maxEmployees },
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="bg-blue-500 rounded-full h-2"
                style={{ width: `${(usageData.employees.current / usageData.employees.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {((usageData.employees.current / usageData.employees.max) * 100).toFixed(0)}% used
            </p>
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
                    {usageData.storage.current} GB
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                of {usageData.storage.max} GB
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 rounded-full h-2"
                style={{ width: `${(usageData.storage.current / usageData.storage.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {((usageData.storage.current / usageData.storage.max) * 100).toFixed(1)}% used
            </p>
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
                className="bg-green-500 rounded-full h-2"
                style={{ width: `${(usageData.apiCalls.current / usageData.apiCalls.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {((usageData.apiCalls.current / usageData.apiCalls.max) * 100).toFixed(0)}% used
            </p>
          </CardBody>
        </Card>

        {/* Active Users */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Users (30d)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usageData.activeUsers.current}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {((usageData.activeUsers.current / usageData.employees.current) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-500 rounded-full h-2"
                style={{ width: `${(usageData.activeUsers.current / usageData.employees.current) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Engagement rate
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Module Usage */}
      <Card>
        <CardBody>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Module Usage
          </h4>

          <div className="space-y-3">
            {[
              { name: 'Employee Management', usage: 95, color: 'bg-blue-500' },
              { name: 'Attendance', usage: 87, color: 'bg-green-500' },
              { name: 'Leave Management', usage: 78, color: 'bg-purple-500' },
              { name: 'Payroll', usage: 92, color: 'bg-orange-500' },
              { name: 'Performance', usage: 65, color: 'bg-pink-500' },
            ].map((module) => (
              <div key={module.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{module.name}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{module.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${module.color} rounded-full h-2`}
                    style={{ width: `${module.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
