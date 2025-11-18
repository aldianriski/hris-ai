'use client';

import { Card, CardBody, Chip, Button } from '@heroui/react';
import { AlertCircle, TrendingUp, DollarSign, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PayrollError {
  id: string;
  employeeId: string;
  employeeName: string;
  errorType: 'salary_spike' | 'bpjs_missing' | 'tax_bracket_wrong' | 'overtime_error' | 'duplicate_payment';
  severity: 'critical' | 'high' | 'medium';
  description: string;
  expected: string;
  actual: string;
  difference: number;
  aiConfidence: number;
  suggestion: string;
}

const ERROR_TYPE_LABELS = {
  salary_spike: 'Salary Spike',
  bpjs_missing: 'BPJS Deduction Missing',
  tax_bracket_wrong: 'Wrong Tax Bracket',
  overtime_error: 'Overtime Calculation Error',
  duplicate_payment: 'Duplicate Payment',
};

const SEVERITY_COLOR_MAP = {
  critical: 'danger',
  high: 'warning',
  medium: 'primary',
} as const;

export function PayrollErrorDetectionPanel({ errors }: { errors: PayrollError[] }) {
  if (errors.length === 0) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20">
        <CardBody className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            No Errors Detected
          </h3>
          <p className="text-sm text-green-700 dark:text-green-200">
            AI validation complete. All payroll calculations are correct.
          </p>
        </CardBody>
      </Card>
    );
  }

  const stats = {
    total: errors.length,
    critical: errors.filter((e) => e.severity === 'critical').length,
    totalDifference: errors.reduce((sum, e) => sum + Math.abs(e.difference), 0),
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardBody className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Critical Errors</p>
          </CardBody>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardBody className="text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
          </CardBody>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardBody className="text-center">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              Rp {stats.totalDifference.toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Discrepancy</p>
          </CardBody>
        </Card>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {errors.map((error) => (
          <Card key={error.id} className="border-l-4" style={{ borderLeftColor: error.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
            <CardBody>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{error.employeeName}</h4>
                    <span className="text-sm text-gray-500">({error.employeeId})</span>
                    <Chip
                      size="sm"
                      color={SEVERITY_COLOR_MAP[error.severity]}
                      variant="flat"
                    >
                      {error.severity.toUpperCase()}
                    </Chip>
                    <Chip size="sm" variant="flat">
                      {ERROR_TYPE_LABELS[error.errorType]}
                    </Chip>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {error.description}
                  </p>
                </div>
                <Chip size="sm" color="secondary" variant="flat">
                  AI: {error.aiConfidence}%
                </Chip>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <p className="text-sm text-gray-500">Expected</p>
                  <p className="font-medium text-green-600">{error.expected}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Actual</p>
                  <p className="font-medium text-red-600">{error.actual}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Difference</p>
                  <p className="font-medium text-orange-600">
                    Rp {Math.abs(error.difference).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    AI Suggestion
                  </p>
                  <p className="text-blue-700 dark:text-blue-200">{error.suggestion}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" color="primary">
                  Fix Automatically
                </Button>
                <Button size="sm" variant="bordered">
                  Manual Review
                </Button>
                <Button size="sm" variant="light" color="warning">
                  False Positive
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
