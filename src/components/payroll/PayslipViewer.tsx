/**
 * Payslip Viewer Component
 * Display detailed payslip information
 */

'use client';

import { Download, Printer, Mail } from 'lucide-react';

interface PayslipItem {
  name: string;
  amount: number;
  type: 'earning' | 'deduction';
}

interface Payslip {
  id: string;
  employeeName: string;
  employeeNumber: string;
  department: string;
  position: string;
  period: string;
  payDate: string;
  baseSalary: number;
  allowances: PayslipItem[];
  deductions: PayslipItem[];
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  bankName?: string;
  bankAccount?: string;
}

interface PayslipViewerProps {
  payslip: Payslip;
  onDownload?: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function PayslipViewer({
  payslip,
  onDownload,
  onPrint,
  onEmail,
}: PayslipViewerProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payslip</h2>
            <p className="mt-1 text-sm text-gray-600">Period: {payslip.period}</p>
          </div>
          <div className="flex gap-2">
            {onEmail && (
              <button
                onClick={onEmail}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
            )}
            {onPrint && (
              <button
                onClick={onPrint}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Employee Info */}
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div>
            <p className="text-sm text-gray-600">Employee Name</p>
            <p className="font-semibold text-gray-900">{payslip.employeeName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Employee Number</p>
            <p className="font-semibold text-gray-900">{payslip.employeeNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="font-semibold text-gray-900">{payslip.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Position</p>
            <p className="font-semibold text-gray-900">{payslip.position}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pay Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(payslip.payDate).toLocaleDateString('id-ID')}
            </p>
          </div>
          {payslip.bankName && (
            <div>
              <p className="text-sm text-gray-600">Bank Account</p>
              <p className="font-semibold text-gray-900">
                {payslip.bankName} - {payslip.bankAccount}
              </p>
            </div>
          )}
        </div>

        {/* Earnings */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Earnings</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
              <span className="font-medium text-gray-900">Base Salary</span>
              <span className="font-bold text-green-600">
                {formatCurrency(payslip.baseSalary)}
              </span>
            </div>
            {payslip.allowances.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-gray-200 p-3">
              <span className="font-semibold text-gray-900">Total Earnings</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(payslip.totalEarnings)}
              </span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Deductions</h3>
          <div className="space-y-2">
            {payslip.deductions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-gray-200 p-3">
              <span className="font-semibold text-gray-900">Total Deductions</span>
              <span className="text-xl font-bold text-red-600">
                {formatCurrency(payslip.totalDeductions)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="rounded-lg bg-blue-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Net Salary</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(payslip.netSalary)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-xs text-gray-600">
            This is a computer-generated payslip and does not require a signature.
            For any queries, please contact the HR department.
          </p>
        </div>
      </div>
    </div>
  );
}
