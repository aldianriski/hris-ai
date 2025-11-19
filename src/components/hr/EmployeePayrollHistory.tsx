'use client';

import { useState, useEffect } from 'react';
import { Button, Chip, Spinner, Card, CardBody } from '@heroui/react';
import { Download, Eye, AlertCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface PayrollRecord {
  id: string;
  period_month: number;
  period_year: number;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid';
  paid_at?: string;
}

interface EmployeePayrollHistoryProps {
  employeeId: string;
}

export function EmployeePayrollHistory({ employeeId }: EmployeePayrollHistoryProps) {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayrollHistory() {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/payroll/payslips/${employeeId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch payroll history');
        }

        const result = await response.json();
        setPayrollRecords(result.data || []);
      } catch (err) {
        console.error('Error fetching payroll history:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payroll history');
      } finally {
        setLoading(false);
      }
    }

    fetchPayrollHistory();
  }, [employeeId]);

  const statusColorMap = {
    paid: 'success',
    approved: 'primary',
    draft: 'default',
  } as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading payroll history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Payroll</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button color="primary" size="sm" onPress={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payroll History</h3>
      </div>

      {payrollRecords.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No payroll records yet</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {payrollRecords.map((record) => {
            const periodDate = new Date(record.period_year, record.period_month - 1, 1);

            return (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium">
                      {format(periodDate, 'MMMM yyyy')}
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
                        Rp {record.gross_salary.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Deductions</p>
                      <p className="font-medium text-red-600">
                        - Rp {record.total_deductions.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Net Salary</p>
                      <p className="font-medium text-green-600">
                        Rp {record.net_salary.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {record.paid_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Paid on {format(new Date(record.paid_at), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="View payslip"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Download payslip"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
