'use client';

import { Button, Chip } from '@heroui/react';
import { Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface PayrollRecord {
  id: string;
  period: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending' | 'processing';
  paidAt?: string;
}

interface EmployeePayrollHistoryProps {
  employeeId: string;
}

export function EmployeePayrollHistory({ employeeId }: EmployeePayrollHistoryProps) {
  // TODO: Fetch actual payroll history from API
  const payrollRecords: PayrollRecord[] = [
    {
      id: '1',
      period: '2024-10',
      grossSalary: 10000000,
      deductions: 400000,
      netSalary: 9600000,
      status: 'paid',
      paidAt: '2024-11-05',
    },
    {
      id: '2',
      period: '2024-09',
      grossSalary: 10000000,
      deductions: 400000,
      netSalary: 9600000,
      status: 'paid',
      paidAt: '2024-10-05',
    },
    {
      id: '3',
      period: '2024-08',
      grossSalary: 10000000,
      deductions: 400000,
      netSalary: 9600000,
      status: 'paid',
      paidAt: '2024-09-05',
    },
  ];

  const statusColorMap = {
    paid: 'success',
    pending: 'warning',
    processing: 'primary',
  } as const;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payroll History</h3>
      </div>

      {payrollRecords.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No payroll records yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payrollRecords.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-medium">
                    {format(new Date(record.period + '-01'), 'MMMM yyyy')}
                  </p>
                  <Chip
                    size="sm"
                    color={statusColorMap[record.status]}
                    variant="flat"
                  >
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Chip>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Gross Salary</p>
                    <p className="font-medium">
                      Rp {record.grossSalary.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Deductions</p>
                    <p className="font-medium text-red-600">
                      - Rp {record.deductions.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Net Salary</p>
                    <p className="font-medium text-green-600">
                      Rp {record.netSalary.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {record.paidAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Paid on {format(new Date(record.paidAt), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  startContent={<Eye className="w-4 h-4" />}
                >
                  View
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  startContent={<Download className="w-4 h-4" />}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
