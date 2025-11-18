'use client';

import { Input } from '@heroui/react';
import { useFormContext } from 'react-hook-form';
import { EmployeeFormData } from '@/lib/validations/employee';

export function EmployeeSalary() {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<EmployeeFormData>();

  const salary = watch('salary');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register('salary', { valueAsNumber: true })}
          type="number"
          label="Monthly Salary"
          placeholder="5000000"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-sm">Rp</span>
            </div>
          }
          isRequired
          isInvalid={!!errors.salary}
          errorMessage={errors.salary?.message}
        />

        <div className="flex items-center">
          <div className="text-sm">
            <p className="text-gray-600 dark:text-gray-400">Annual Salary</p>
            <p className="text-lg font-semibold">
              Rp {((salary || 0) * 12).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <Input
          {...register('bankName')}
          label="Bank Name"
          placeholder="BCA, Mandiri, BRI, etc."
        />

        <Input
          {...register('bankAccountNumber')}
          label="Bank Account Number"
          placeholder="1234567890"
        />

        <Input
          {...register('bankAccountName')}
          label="Account Holder Name"
          placeholder="Name as per bank account"
        />
      </div>

      {/* Salary Breakdown Preview */}
      {salary > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">BPJS & Tax Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Gross Salary</span>
              <span className="font-medium">Rp {salary.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">BPJS Kesehatan (1%)</span>
              <span className="text-red-600">- Rp {(salary * 0.01).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">BPJS JHT (2%)</span>
              <span className="text-red-600">- Rp {(salary * 0.02).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">BPJS JP (1%)</span>
              <span className="text-red-600">- Rp {(salary * 0.01).toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-semibold">
              <span>Estimated Take Home</span>
              <span className="text-green-600">
                Rp {(salary * 0.96).toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * This is an estimate. Actual deductions may vary based on BPJS status and tax calculations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
