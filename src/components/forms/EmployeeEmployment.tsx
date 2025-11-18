'use client';

import { Input, Select, SelectItem } from '@heroui/react';
import { useFormContext } from 'react-hook-form';
import { EmployeeFormData } from '@/lib/validations/employee';

const EMPLOYMENT_TYPES = [
  { value: 'permanent', label: 'Permanent (PKWTT)' },
  { value: 'contract', label: 'Contract (PKWT)' },
  { value: 'probation', label: 'Probation' },
  { value: 'intern', label: 'Intern' },
  { value: 'part_time', label: 'Part Time' },
];

const EMPLOYMENT_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'resigned', label: 'Resigned' },
];

export function EmployeeEmployment() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<EmployeeFormData>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        {...register('department')}
        label="Department"
        placeholder="Engineering, Marketing, Sales, etc."
        isRequired
        isInvalid={!!errors.department}
        errorMessage={errors.department?.message}
      />

      <Input
        {...register('position')}
        label="Position"
        placeholder="Software Engineer, Manager, etc."
        isRequired
        isInvalid={!!errors.position}
        errorMessage={errors.position?.message}
      />

      <Select
        label="Employment Type"
        placeholder="Select type"
        selectedKeys={watch('employmentType') ? [watch('employmentType')] : []}
        onChange={(e) => setValue('employmentType', e.target.value as any)}
        isRequired
        isInvalid={!!errors.employmentType}
        errorMessage={errors.employmentType?.message}
      >
        {EMPLOYMENT_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Employment Status"
        placeholder="Select status"
        selectedKeys={watch('employmentStatus') ? [watch('employmentStatus')] : []}
        onChange={(e) => setValue('employmentStatus', e.target.value as any)}
        isRequired
        isInvalid={!!errors.employmentStatus}
        errorMessage={errors.employmentStatus?.message}
      >
        {EMPLOYMENT_STATUS.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </Select>

      <Input
        {...register('joinDate')}
        type="date"
        label="Join Date"
        isRequired
        isInvalid={!!errors.joinDate}
        errorMessage={errors.joinDate?.message}
      />

      <Input
        {...register('manager')}
        label="Manager"
        placeholder="Select manager (optional)"
      />

      <Input
        {...register('workLocation')}
        label="Work Location"
        placeholder="Main Office, Branch, Remote"
        isRequired
        isInvalid={!!errors.workLocation}
        errorMessage={errors.workLocation?.message}
      />

      <Input
        {...register('workSchedule')}
        label="Work Schedule"
        placeholder="Monday - Friday, 09:00 - 17:00"
        isRequired
        isInvalid={!!errors.workSchedule}
        errorMessage={errors.workSchedule?.message}
      />
    </div>
  );
}
