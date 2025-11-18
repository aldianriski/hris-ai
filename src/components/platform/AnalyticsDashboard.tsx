'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import {
  Users,
  Building2,
  TrendingUp,
  Activity,
  DollarSign,
  UserPlus,
  Calendar
} from 'lucide-react';

// Mock analytics data
const overviewMetrics = {
  totalTenants: 156,
  tenantGrowth: 12.5,
  totalUsers: 3891,
  userGrowth: 8.3,
  activeUsers: 3245,
  activityRate: 83.4,
  mrr: 46500000,
  mrrGrowth: 15.2,
};

const growthData = [
  { month: 'Jun', tenants: 120, users: 2890, revenue: 38200000 },
  { month: 'Jul', tenants: 128, users: 3102, revenue: 40100000 },
  { month: 'Aug', tenants: 135, users: 3356, revenue: 42300000 },
  { month: 'Sep', tenants: 142, users: 3598, revenue: 43800000 },
  { month: 'Oct', tenants: 148, users: 3712, revenue: 44900000 },
  { month: 'Nov', tenants: 156, users: 3891, revenue: 46500000 },
];

const tenantsByIndustry = [
  { industry: 'Technology', count: 42, percentage: 27 },
  { industry: 'Manufacturing', count: 35, percentage: 22 },
  { industry: 'Retail', count: 28, percentage: 18 },
  { industry: 'Healthcare', count: 21, percentage: 13 },
  { industry: 'Finance', count: 18, percentage: 12 },
  { industry: 'Others', count: 12, percentage: 8 },
];

const tenantsBySize = [
  { size: '1-10', count: 23, percentage: 15 },
  { size: '11-50', count: 67, percentage: 43 },
  { size: '51-200', count: 58, percentage: 37 },
  { size: '201-500', count: 6, percentage: 4 },
  { size: '500+', count: 2, percentage: 1 },
];

export function AnalyticsDashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Tenants
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {overviewMetrics.totalTenants.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">
                    +{overviewMetrics.tenantGrowth}%
                  </span>
                  <span className="text-xs text-gray-500">this month</span>
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
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {overviewMetrics.totalUsers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <UserPlus className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">
                    +{overviewMetrics.userGrowth}%
                  </span>
                  <span className="text-xs text-gray-500">this month</span>
                </div>
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
                  Active Users
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {overviewMetrics.activeUsers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-500">
                    {overviewMetrics.activityRate}%
                  </span>
                  <span className="text-xs text-gray-500">activity rate</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {formatCurrency(overviewMetrics.mrr)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">
                    +{overviewMetrics.mrrGrowth}%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Growth Trend */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            6-Month Growth Trend
          </h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {growthData.map((month) => (
              <div key={month.month} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium text-gray-500">
                  {month.month}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Tenants: {month.tenants}</span>
                    <span className="text-gray-600">Users: {month.users}</span>
                    <span className="text-gray-600">{formatCurrency(month.revenue)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${(month.revenue / 46500000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenants by Industry */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tenants by Industry
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {tenantsByIndustry.map((item) => (
                <div key={item.industry} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[120px]">
                      {item.industry}
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                    <Chip size="sm" variant="flat">
                      {item.percentage}%
                    </Chip>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Tenants by Size */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tenants by Company Size
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {tenantsBySize.map((item) => (
                <div key={item.size} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[80px]">
                      {item.size} employees
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                    <Chip size="sm" variant="flat" color="secondary">
                      {item.percentage}%
                    </Chip>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
