'use client';

import { Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useFormContext } from 'react-hook-form';
import { EmployeeFormData } from '@/lib/validations/employee';

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const MARITAL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export function EmployeeBasicInfo() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<EmployeeFormData>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        {...register('firstName')}
        label="First Name"
        placeholder="Enter first name"
        isRequired
        isInvalid={!!errors.firstName}
        errorMessage={errors.firstName?.message}
      />

      <Input
        {...register('middleName')}
        label="Middle Name"
        placeholder="Enter middle name (optional)"
      />

      <Input
        {...register('lastName')}
        label="Last Name"
        placeholder="Enter last name"
        isRequired
        isInvalid={!!errors.lastName}
        errorMessage={errors.lastName?.message}
      />

      <Input
        {...register('email')}
        type="email"
        label="Email"
        placeholder="employee@company.com"
        isRequired
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
      />

      <Input
        {...register('phone')}
        label="Phone Number"
        placeholder="+62 812 3456 7890"
        isRequired
        isInvalid={!!errors.phone}
        errorMessage={errors.phone?.message}
      />

      <Input
        {...register('dateOfBirth')}
        type="date"
        label="Date of Birth"
        isRequired
        isInvalid={!!errors.dateOfBirth}
        errorMessage={errors.dateOfBirth?.message}
      />

      <Select
        label="Gender"
        placeholder="Select gender"
        selectedKeys={watch('gender') ? [watch('gender')] : []}
        onChange={(e) => setValue('gender', e.target.value as any)}
        isRequired
        isInvalid={!!errors.gender}
        errorMessage={errors.gender?.message}
      >
        {GENDERS.map((gender) => (
          <SelectItem key={gender.value} value={gender.value}>
            {gender.label}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Marital Status"
        placeholder="Select marital status"
        selectedKeys={watch('maritalStatus') ? [watch('maritalStatus')] : []}
        onChange={(e) => setValue('maritalStatus', e.target.value as any)}
        isRequired
        isInvalid={!!errors.maritalStatus}
        errorMessage={errors.maritalStatus?.message}
      >
        {MARITAL_STATUS.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </Select>

      <Input
        {...register('nationality')}
        label="Nationality"
        placeholder="Indonesian"
        isRequired
        isInvalid={!!errors.nationality}
        errorMessage={errors.nationality?.message}
      />

      <Input
        {...register('nationalId')}
        label="National ID (KTP)"
        placeholder="3201234567890001"
      />

      <Input
        {...register('taxId')}
        label="Tax ID (NPWP)"
        placeholder="12.345.678.9-012.000"
      />

      <div className="md:col-span-2">
        <Textarea
          {...register('address')}
          label="Address"
          placeholder="Enter full address"
          minRows={3}
          isRequired
          isInvalid={!!errors.address}
          errorMessage={errors.address?.message}
        />
      </div>

      <Input
        {...register('city')}
        label="City"
        placeholder="Jakarta"
        isRequired
        isInvalid={!!errors.city}
        errorMessage={errors.city?.message}
      />

      <Input
        {...register('province')}
        label="Province"
        placeholder="DKI Jakarta"
        isRequired
        isInvalid={!!errors.province}
        errorMessage={errors.province?.message}
      />

      <Input
        {...register('postalCode')}
        label="Postal Code"
        placeholder="12345"
      />
    </div>
  );
}
