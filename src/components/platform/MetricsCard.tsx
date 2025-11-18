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
    primary: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30',
    secondary: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30',
    success: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30',
    danger: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30',
  };

  const iconColorClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-purple-600 dark:text-purple-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 transition-all duration-300 group-hover:scale-105">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className={`
            w-14 h-14 rounded-xl ${bgColorClasses[color]}
            flex items-center justify-center
            transition-all duration-300
            group-hover:scale-110 group-hover:rotate-3
            shadow-sm group-hover:shadow-md
          `}>
            <Icon className={`w-7 h-7 ${iconColorClasses[color]} transition-transform duration-300`} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          {trend === 'up' ? (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
            </div>
          )}
          <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            vs last month
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
