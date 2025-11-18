'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@heroui/react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const colorClasses = {
  primary: 'bg-talixa-indigo-50 dark:bg-talixa-indigo-900/20 text-talixa-indigo',
  success: 'bg-green-50 dark:bg-green-900/20 text-green-600',
  warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
  danger: 'bg-red-50 dark:bg-red-900/20 text-red-600',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="border-none shadow-talixa hover:shadow-talixa-lg transition-shadow">
        <CardBody className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {title}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {value}
              </p>
              {trend && (
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      trend.isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {trend.isPositive ? '+' : ''}
                    {trend.value}%
                  </span>
                  <span className="text-sm text-gray-500">vs bulan lalu</span>
                </div>
              )}
            </div>
            <div
              className={cn(
                'p-3 rounded-lg',
                colorClasses[color]
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
