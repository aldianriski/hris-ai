/**
 * Dashboard Stats Component
 * Display key metrics in card format
 */

'use client';

import { TrendingUp, TrendingDown, Users, Clock, Calendar, DollarSign } from 'lucide-react';

interface Stat {
  name: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: any;
  color: string;
}

interface DashboardStatsProps {
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  {
    name: 'Total Employees',
    value: 248,
    change: 12,
    changeType: 'increase',
    icon: Users,
    color: 'blue',
  },
  {
    name: 'Present Today',
    value: 235,
    change: -3,
    changeType: 'decrease',
    icon: Clock,
    color: 'green',
  },
  {
    name: 'Pending Leaves',
    value: 8,
    change: 2,
    changeType: 'increase',
    icon: Calendar,
    color: 'yellow',
  },
  {
    name: 'Monthly Payroll',
    value: 'Rp 2.4B',
    change: 5.4,
    changeType: 'increase',
    icon: DollarSign,
    color: 'purple',
  },
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'bg-blue-100 text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'bg-green-100 text-green-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    icon: 'bg-yellow-100 text-yellow-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'bg-purple-100 text-purple-600',
  },
};

export function DashboardStats({ stats = defaultStats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color as keyof typeof colorClasses];
        const TrendIcon = stat.changeType === 'increase' ? TrendingUp : TrendingDown;
        const trendColor = stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600';

        return (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-3 ${colors.icon}`}>
                  <Icon className="h-6 w-6" />
                </div>
                {stat.change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className={`mt-2 text-3xl font-semibold ${colors.text}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
