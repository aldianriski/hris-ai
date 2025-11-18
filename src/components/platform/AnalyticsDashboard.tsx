'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Spinner, Chip } from '@heroui/react';
import {
  BarChart3,
  Users,
  Building2,
  DollarSign,
  LifeBuoy,
  Flag,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Analytics {
  overview: {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    newTenantsThisMonth: number;
  };
  revenue: {
    totalRevenue: number;
    pendingRevenue: number;
    paidInvoices: number;
    totalInvoices: number;
  };
  support: {
    totalTickets: number;
    openTickets: number;
    avgResolutionHours: number;
    ticketResolutionRate: number;
  };
  features: {
    totalFlags: number;
    activeFlags: number;
    totalPlans: number;
  };
  growth: {
    monthlyTenants: Record<string, number>;
    topTenants: any[];
  };
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform/analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const { data } = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-12 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  const tenantGrowthRate = analytics.overview.totalTenants > 0
    ? Math.round((analytics.overview.newTenantsThisMonth / analytics.overview.totalTenants) * 100)
    : 0;

  const revenueCollectionRate = analytics.revenue.totalInvoices > 0
    ? Math.round((analytics.revenue.paidInvoices / analytics.revenue.totalInvoices) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Tenants
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {analytics.overview.totalTenants}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip size="sm" color="success" variant="flat">
                      {analytics.overview.activeTenants} active
                    </Chip>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {analytics.overview.totalUsers}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>Across all tenants</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    New This Month
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {analytics.overview.newTenantsThisMonth}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {tenantGrowthRate > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-xs text-success font-semibold">
                          +{tenantGrowthRate}% growth
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">No growth yet</span>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Feature Flags
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {analytics.features.totalFlags}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip size="sm" color="primary" variant="flat">
                      {analytics.features.activeFlags} active
                    </Chip>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Flag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Revenue Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue & Billing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                    {formatCurrency(analytics.revenue.totalRevenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-success">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{analytics.revenue.paidInvoices} paid invoices</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Pending Revenue
                  </p>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                    {formatCurrency(analytics.revenue.pendingRevenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Awaiting payment</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Collection Rate
                  </p>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                    {revenueCollectionRate}%
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <span>{analytics.revenue.totalInvoices} total invoices</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Support Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Support & Tickets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Tickets
                  </p>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                    {analytics.support.totalTickets}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Open Tickets
                  </p>
                  <p className="text-2xl font-bold mt-2 text-warning">
                    {analytics.support.openTickets}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Avg Resolution
                  </p>
                  <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                    {analytics.support.avgResolutionHours}h
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Resolution Rate
                  </p>
                  <p className="text-2xl font-bold mt-2 text-success">
                    {analytics.support.ticketResolutionRate}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Tenant Growth Chart */}
      {Object.keys(analytics.growth.monthlyTenants).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tenant Growth (Last 12 Months)
          </h2>
          <Card>
            <CardBody className="p-6">
              <div className="space-y-3">
                {Object.entries(analytics.growth.monthlyTenants)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .slice(-12)
                  .map(([month, count]) => {
                    const maxCount = Math.max(...Object.values(analytics.growth.monthlyTenants));
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                      <div key={month} className="flex items-center gap-4">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400 w-20">
                          {month}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-300 flex items-center justify-end pr-3"
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 10 && (
                              <span className="text-xs font-semibold text-white">
                                {count} tenant{count !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        {percentage <= 10 && (
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-16">
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Platform Health Summary</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tenant Engagement</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-success h-full rounded-full"
                    style={{ width: `${(analytics.overview.activeTenants / Math.max(analytics.overview.totalTenants, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.round((analytics.overview.activeTenants / Math.max(analytics.overview.totalTenants, 1)) * 100)}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Support Performance</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${analytics.support.ticketResolutionRate}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {analytics.support.ticketResolutionRate}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Revenue Collection</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-success h-full rounded-full"
                    style={{ width: `${revenueCollectionRate}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {revenueCollectionRate}%
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
