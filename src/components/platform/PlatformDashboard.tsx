'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Spinner } from '@heroui/react';
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

interface DashboardMetrics {
  tenantMetrics: {
    total: number;
    active: number;
    trial: number;
    paused: number;
    churned: number;
    newThisMonth: number;
  };
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
  };
  revenueMetrics: {
    mrr: number;
    arr: number;
    churnRate: number;
    averageRevenuePerTenant: number;
  };
  systemHealth: {
    uptime: number;
    apiLatency: number;
    errorRate: number;
    dbConnections: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'upgrade' | 'new_tenant' | 'payment' | 'churn';
    tenantName: string;
    description: string;
    timestamp: string;
  }>;
  growthData: Array<{
    month: string;
    total: number;
    new: number;
    churned: number;
  }>;
  revenueData: Array<{
    month: string;
    mrr: number;
    arr: number;
  }>;
  lastUpdated: string;
}

export function PlatformDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const response = await fetch('/api/platform/dashboard/metrics');

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard metrics');
        }

        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();

    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardBody>
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error Loading Dashboard</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const { tenantMetrics, userMetrics, revenueMetrics, systemHealth, recentActivity } = metrics;

  // Calculate growth rate for tenants
  const growthRate = tenantMetrics.total > 0
    ? (tenantMetrics.newThisMonth / tenantMetrics.total) * 100
    : 0;

  // Calculate average users per tenant
  const averageUsersPerTenant = tenantMetrics.active > 0
    ? userMetrics.totalUsers / tenantMetrics.active
    : 0;

  // Format time ago for recent activity
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Tenants"
          value={tenantMetrics.total.toString()}
          change={parseFloat(growthRate.toFixed(2))}
          trend={growthRate >= 0 ? "up" : "down"}
          icon={Building2}
          subtitle={`${tenantMetrics.newThisMonth} new this month`}
          color="primary"
        />

        <MetricsCard
          title="Active Users"
          value={userMetrics.activeUsers.toLocaleString()}
          change={userMetrics.totalUsers > 0 ? parseFloat(((userMetrics.activeUsers / userMetrics.totalUsers) * 100).toFixed(1)) : 0}
          trend="up"
          icon={Users}
          subtitle={`${userMetrics.newUsersToday} new today`}
          color="secondary"
        />

        <MetricsCard
          title="MRR"
          value={`Rp ${(revenueMetrics.mrr / 1000000).toFixed(1)}M`}
          change={revenueMetrics.mrr > 0 ? parseFloat(((revenueMetrics.mrr / 1000000) * 0.1).toFixed(2)) : 0}
          trend="up"
          icon={DollarSign}
          subtitle={`ARR: Rp ${(revenueMetrics.arr / 1000000).toFixed(0)}M`}
          color="success"
        />

        <MetricsCard
          title="System Health"
          value={`${systemHealth.uptime}%`}
          change={0}
          trend={systemHealth.uptime >= 99.5 ? "up" : "down"}
          icon={Activity}
          subtitle={`${systemHealth.apiLatency}ms avg latency`}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tenant Growth</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <TenantGrowthChart data={metrics.growthData} />
          </CardBody>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <RevenueChart data={metrics.revenueData} />
          </CardBody>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800/30 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tenants</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {tenantMetrics.active}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {((tenantMetrics.active / tenantMetrics.total) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-blue-200 dark:bg-blue-700 flex items-center justify-center shadow-md">
                <Building2 className="w-10 h-10 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800/30 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trial Accounts</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {tenantMetrics.trial}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Potential conversions
                </p>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-green-200 dark:bg-green-700 flex items-center justify-center shadow-md">
                <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800/30 hover:shadow-lg transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Churn Rate</p>
                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {revenueMetrics.churnRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {tenantMetrics.churned} churned this month
                </p>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-orange-200 dark:bg-orange-700 flex items-center justify-center shadow-md">
                <TrendingDown className="w-10 h-10 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/50 dark:to-transparent border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-all"
                  >
                    <div className={`
                      w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm
                      ${activity.type === 'upgrade' ? 'bg-green-500 shadow-green-500/50' : ''}
                      ${activity.type === 'new_tenant' ? 'bg-blue-500 shadow-blue-500/50' : ''}
                      ${activity.type === 'payment' ? 'bg-purple-500 shadow-purple-500/50' : ''}
                      ${activity.type === 'churn' ? 'bg-red-500 shadow-red-500/50' : ''}
                    `} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {activity.tenantName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Stats</h3>

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
                  <span className="font-medium">{averageUsersPerTenant.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-secondary rounded-full h-2" style={{ width: `${Math.min((averageUsersPerTenant / 50) * 100, 100)}%` }} />
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
