'use client';

import { Input, Select, SelectItem, Card, CardBody } from '@heroui/react';
import { useFormContext } from 'react-hook-form';
import { EmployeeFormData } from '@/lib/validations/employee';

const BPJS_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function EmployeeBPJS() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<EmployeeFormData>();

  return (
    <div className="space-y-6">
      {/* BPJS Kesehatan */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold mb-4">BPJS Kesehatan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              {...register('bpjsKesehatanNumber')}
              label="BPJS Kesehatan Number"
              placeholder="0001234567890"
            />

            <Select
              label="Status"
              placeholder="Select status"
              selectedKeys={watch('bpjsKesehatanStatus') ? [watch('bpjsKesehatanStatus')] : []}
              onChange={(e) => setValue('bpjsKesehatanStatus', e.target.value as any)}
            >
              {BPJS_STATUS.map((status) => (
                <SelectItem key={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
            <p className="font-medium mb-1">Employee Contribution:</p>
            <p className="text-gray-600 dark:text-gray-400">
              1% of gross salary (deducted from payroll)
            </p>
            <p className="font-medium mt-2 mb-1">Employer Contribution:</p>
            <p className="text-gray-600 dark:text-gray-400">
              4% of gross salary
            </p>
          </div>
        </CardBody>
      </Card>

      {/* BPJS Ketenagakerjaan */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold mb-4">BPJS Ketenagakerjaan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              {...register('bpjsKetenagakerjaanNumber')}
              label="BPJS Ketenagakerjaan Number"
              placeholder="0001234567890"
            />

            <Select
              label="Status"
              placeholder="Select status"
              selectedKeys={watch('bpjsKetenagakerjaanStatus') ? [watch('bpjsKetenagakerjaanStatus')] : []}
              onChange={(e) => setValue('bpjsKetenagakerjaanStatus', e.target.value as any)}
            >
              {BPJS_STATUS.map((status) => (
                <SelectItem key={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm space-y-3">
            <div>
              <p className="font-medium mb-1">JKK (Jaminan Kecelakaan Kerja):</p>
              <p className="text-gray-600 dark:text-gray-400">
                0.24% - 1.74% of gross salary (employer pays)
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">JKM (Jaminan Kematian):</p>
              <p className="text-gray-600 dark:text-gray-400">
                0.3% of gross salary (employer pays)
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">JHT (Jaminan Hari Tua):</p>
              <p className="text-gray-600 dark:text-gray-400">
                Employee: 2%, Employer: 3.7% of gross salary
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">JP (Jaminan Pensiun):</p>
              <p className="text-gray-600 dark:text-gray-400">
                Employee: 1%, Employer: 2% of gross salary
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Info Card */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardBody>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> BPJS contributions are automatically calculated during payroll processing.
            Make sure the BPJS numbers are correct to ensure proper compliance.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
