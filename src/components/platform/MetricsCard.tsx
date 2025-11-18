'use client';

import { Card, CardBody } from '@heroui/react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: LucideIcon;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function MetricsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  subtitle,
  color = 'primary'
}: MetricsCardProps) {
  const colorClasses = {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'from-purple-500 to-purple-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
  };

  const bgColorClasses = {
    primary: 'bg-blue-100 dark:bg-blue-900/30',
    secondary: 'bg-purple-100 dark:bg-purple-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30',
    danger: 'bg-red-100 dark:bg-red-900/30',
  };

  const iconColorClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-purple-600 dark:text-purple-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <div className={`w-12 h-12 rounded-lg ${bgColorClasses[color]} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
          </div>
        </div>

        <div className="flex items-center gap-1 mt-3">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            vs last month
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
