/**
 * Payroll Period Card Component
 * Display payroll period summary with actions
 */

'use client';

import { DollarSign, Users, Calendar, Download, Send, CheckCircle, AlertCircle } from 'lucide-react';

export interface PayrollPeriod {
  id: string;
  month: number;
  year: number;
  status: 'draft' | 'processing' | 'completed' | 'paid';
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  processedAt?: string;
  paidAt?: string;
}

export interface PayrollPeriodCardProps {
  period: PayrollPeriod;
  onProcess?: (id: string) => void;
  onDownload?: (id: string) => void;
  onSendPayslips?: (id: string) => void;
}

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: AlertCircle,
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  paid: {
    label: 'Paid',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle,
  },
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function PayrollPeriodCard({
  period,
  onProcess,
  onDownload,
  onSendPayslips,
}: PayrollPeriodCardProps) {
  const statusInfo = statusConfig[period.status];
  const StatusIcon = statusInfo.icon;
  const isDraft = period.status === 'draft';
  const isCompleted = period.status === 'completed' || period.status === 'paid';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {monthNames[period.month - 1]} {period.year}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}>
              <StatusIcon className="h-4 w-4" />
              {statusInfo.label}
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <DollarSign className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            Employees
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {period.totalEmployees}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            Gross Salary
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {formatCurrency(period.totalGrossSalary)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            Deductions
          </div>
          <p className="mt-2 text-lg font-bold text-red-600">
            {formatCurrency(period.totalDeductions)}
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <DollarSign className="h-4 w-4" />
            Net Salary
          </div>
          <p className="mt-2 text-lg font-bold text-blue-600">
            {formatCurrency(period.totalNetSalary)}
          </p>
        </div>
      </div>

      {/* Dates */}
      {period.processedAt && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          Processed: {new Date(period.processedAt).toLocaleDateString('id-ID')}
        </div>
      )}
      {period.paidAt && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4" />
          Paid: {new Date(period.paidAt).toLocaleDateString('id-ID')}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {isDraft && onProcess && (
          <button
            onClick={() => onProcess(period.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <DollarSign className="h-4 w-4" />
            Process Payroll
          </button>
        )}

        {isCompleted && (
          <>
            {onDownload && (
              <button
                onClick={() => onDownload(period.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            )}
            {onSendPayslips && (
              <button
                onClick={() => onSendPayslips(period.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                Send Payslips
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
