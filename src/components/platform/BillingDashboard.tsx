'use client';

import { Card, CardBody, CardHeader, Chip, Button } from '@heroui/react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// Mock data - will be replaced with real API
const revenueMetrics = {
  mrr: 46500000, // Monthly Recurring Revenue
  arr: 558000000, // Annual Recurring Revenue
  growth: 12.5, // Percentage
  activeSubscriptions: 156,
  churnRate: 2.1,
};

const subscriptionBreakdown = [
  { plan: 'Trial', count: 23, revenue: 0, color: 'default' },
  { plan: 'Starter', count: 67, revenue: 6633000, color: 'primary' },
  { plan: 'Professional', count: 58, revenue: 17342000, color: 'secondary' },
  { plan: 'Enterprise', count: 8, revenue: 22525000, color: 'success' },
];

const recentTransactions = [
  {
    id: '1',
    tenant: 'PT Maju Bersama',
    amount: 299000,
    plan: 'Professional',
    status: 'success',
    date: '2024-11-18T10:30:00Z'
  },
  {
    id: '2',
    tenant: 'CV Digital Solutions',
    amount: 99000,
    plan: 'Starter',
    status: 'success',
    date: '2024-11-18T09:15:00Z'
  },
  {
    id: '3',
    tenant: 'PT Tech Inovasi',
    amount: 299000,
    plan: 'Professional',
    status: 'pending',
    date: '2024-11-18T08:45:00Z'
  },
  {
    id: '4',
    tenant: 'UD Sejahtera',
    amount: 99000,
    plan: 'Starter',
    status: 'failed',
    date: '2024-11-17T16:20:00Z'
  },
];

const statusColors = {
  success: 'success',
  pending: 'warning',
  failed: 'danger',
} as const;

const statusIcons = {
  success: CheckCircle,
  pending: Clock,
  failed: XCircle,
};

export function BillingDashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Monthly Recurring Revenue
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {formatCurrency(revenueMetrics.mrr)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">
                    +{revenueMetrics.growth}%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
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
                  Annual Recurring Revenue
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {formatCurrency(revenueMetrics.arr)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Projected annual revenue
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {revenueMetrics.activeSubscriptions}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Paying customers
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Churn Rate
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {revenueMetrics.churnRate}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Monthly cancellation rate
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subscription Breakdown
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subscriptionBreakdown.map((item) => (
              <div key={item.plan} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">{item.plan}</span>
                  <Chip size="sm" color={item.color as any} variant="flat">
                    {item.count}
                  </Chip>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(item.revenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Monthly revenue</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <Button size="sm" variant="flat" startContent={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const StatusIcon = statusIcons[transaction.status as keyof typeof statusIcons];
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {transaction.tenant}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.plan}</p>
                    </div>

                    <Chip
                      size="sm"
                      color={statusColors[transaction.status as keyof typeof statusColors]}
                      variant="flat"
                      startContent={<StatusIcon className="w-3 h-3" />}
                    >
                      {transaction.status}
                    </Chip>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
