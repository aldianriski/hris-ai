'use client';

import { Card, CardBody } from '@heroui/react';
import {
  Building2,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import { TenantGrowthChart } from './TenantGrowthChart';
import { RevenueChart } from './RevenueChart';

// Mock data - will be replaced with real API data
const mockMetrics = {
  tenantMetrics: {
    total: 156,
    active: 142,
    trial: 28,
    paused: 8,
    churned: 6,
    newThisMonth: 12,
    growthRate: 8.5,
  },
  userMetrics: {
    totalUsers: 4253,
    activeUsers: 3891,
    newUsersToday: 47,
    averageUsersPerTenant: 27.3,
  },
  revenueMetrics: {
    mrr: 46500000, // IDR
    arr: 558000000, // IDR
    churnRate: 3.2,
    averageRevenuePerTenant: 298000,
  },
  systemHealth: {
    uptime: 99.97,
    apiLatency: 127, // ms
    errorRate: 0.08, // percentage
    dbConnections: 42,
  },
};

const recentActivity = [
  {
    id: '1',
    tenant: 'PT Maju Bersama',
    action: 'Upgraded to Professional',
    time: '5 minutes ago',
    type: 'upgrade',
  },
  {
    id: '2',
    tenant: 'CV Digital Solutions',
    action: 'New tenant created',
    time: '1 hour ago',
    type: 'new',
  },
  {
    id: '3',
    tenant: 'PT Karya Sukses',
    action: 'Payment processed',
    time: '2 hours ago',
    type: 'payment',
  },
  {
    id: '4',
    tenant: 'UD Sejahtera',
    action: 'Trial ending in 2 days',
    time: '3 hours ago',
    type: 'warning',
  },
  {
    id: '5',
    tenant: 'PT Tech Inovasi',
    action: 'Support ticket created',
    time: '4 hours ago',
    type: 'support',
  },
];

export function PlatformDashboard() {
  const { tenantMetrics, userMetrics, revenueMetrics, systemHealth } = mockMetrics;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Tenants"
          value={tenantMetrics.total.toString()}
          change={tenantMetrics.growthRate}
          trend="up"
          icon={Building2}
          subtitle={`${tenantMetrics.newThisMonth} new this month`}
          color="primary"
        />

        <MetricsCard
          title="Active Users"
          value={userMetrics.activeUsers.toLocaleString()}
          change={12.3}
          trend="up"
          icon={Users}
          subtitle={`${userMetrics.newUsersToday} new today`}
          color="secondary"
        />

        <MetricsCard
          title="MRR"
          value={`Rp ${(revenueMetrics.mrr / 1000000).toFixed(1)}M`}
          change={15.8}
          trend="up"
          icon={DollarSign}
          subtitle={`ARR: Rp ${(revenueMetrics.arr / 1000000).toFixed(0)}M`}
          color="success"
        />

        <MetricsCard
          title="System Health"
          value={`${systemHealth.uptime}%`}
          change={-0.02}
          trend="down"
          icon={Activity}
          subtitle={`${systemHealth.apiLatency}ms avg latency`}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Tenant Growth</h3>
            <TenantGrowthChart />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <RevenueChart />
          </CardBody>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Tenants</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {tenantMetrics.active}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {((tenantMetrics.active / tenantMetrics.total) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Trial Accounts</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {tenantMetrics.trial}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Potential conversions
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {revenueMetrics.churnRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {tenantMetrics.churned} churned this month
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-orange-200 dark:bg-orange-700 flex items-center justify-center">
                <TrendingDown className="w-8 h-8 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <button className="text-sm text-primary hover:underline">View All</button>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className={`
                    w-2 h-2 rounded-full flex-shrink-0
                    ${activity.type === 'upgrade' ? 'bg-green-500' : ''}
                    ${activity.type === 'new' ? 'bg-blue-500' : ''}
                    ${activity.type === 'payment' ? 'bg-purple-500' : ''}
                    ${activity.type === 'warning' ? 'bg-yellow-500' : ''}
                    ${activity.type === 'support' ? 'bg-red-500' : ''}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.tenant}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.action}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Avg Revenue/Tenant</span>
                  <span className="font-medium">Rp {(revenueMetrics.averageRevenuePerTenant / 1000).toFixed(0)}K</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Avg Users/Tenant</span>
                  <span className="font-medium">{userMetrics.averageUsersPerTenant.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-secondary rounded-full h-2" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">API Uptime</span>
                  <span className="font-medium text-green-600">{systemHealth.uptime}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '99.97%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Error Rate</span>
                  <span className="font-medium text-green-600">{systemHealth.errorRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: '0.08%' }} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">DB Connections</span>
                  <span className="font-medium">{systemHealth.dbConnections}/100</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
