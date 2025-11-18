'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Calendar, DollarSign, Users, MoreVertical, Eye, Play, CheckCircle, Trash2 } from 'lucide-react';
import { PayrollPeriod } from '@/lib/api/types';
import { payrollService } from '@/lib/api/services';
import { format } from 'date-fns';
import Link from 'next/link';

const STATUS_COLOR_MAP = {
  draft: 'default',
  processing: 'primary',
  approved: 'success',
  paid: 'success',
} as const;

const STATUS_ICONS = {
  draft: Calendar,
  processing: Play,
  approved: CheckCircle,
  paid: CheckCircle,
};

interface PayrollPeriodListProps {
  searchParams: {
    status?: string;
    year?: string;
    page?: string;
  };
}

export function PayrollPeriodList({ searchParams }: PayrollPeriodListProps) {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.page || '1', 10);
  const limit = 12;
  const offset = (page - 1) * limit;

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        setLoading(true);

        // TODO: Get actual employerId from auth context
        const params: any = {
          employerId: 'temp-employer-id',
          limit,
          offset,
        };

        if (searchParams.status) params.status = searchParams.status;
        if (searchParams.year) params.year = parseInt(searchParams.year);

        const response = await payrollService.listPeriods(params);
        setPeriods(response.periods);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to fetch payroll periods:', error);
        setPeriods([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriods();
  }, [searchParams, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading payroll periods...</p>
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Calendar className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">No payroll periods found</p>
        <p className="text-sm text-gray-400 mb-4">
          Create your first payroll period to start processing salaries
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {periods.map((period) => {
          const StatusIcon = STATUS_ICONS[period.status];
          const monthYear = format(new Date(period.periodStart), 'MMMM yyyy');

          return (
            <Card
              key={period.id}
              isPressable
              as={Link}
              href={`/hr/payroll/periods/${period.id}`}
              className="hover:scale-105 transition-transform"
            >
              <CardBody>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{monthYear}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(period.periodStart), 'MMM dd')} -{' '}
                      {format(new Date(period.periodEnd), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    color={STATUS_COLOR_MAP[period.status]}
                    variant="flat"
                    startContent={<StatusIcon className="w-3 h-3" />}
                  >
                    {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                  </Chip>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>Employees</span>
                    </div>
                    <span className="font-medium">{period.totalEmployees}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>Gross Salary</span>
                    </div>
                    <span className="font-medium">
                      Rp {(period.totalGrossSalary || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>Net Salary</span>
                    </div>
                    <span className="font-medium text-green-600">
                      Rp {(period.totalNetSalary || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {period.paidAt && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500">
                      Paid on {format(new Date(period.paidAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {total > limit && (
        <div className="flex justify-center">
          <p className="text-sm text-gray-500">
            Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} periods
          </p>
        </div>
      )}
    </div>
  );
}
