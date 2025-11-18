'use client';

import { Input, Select, SelectItem } from '@heroui/react';
import type { CreateTenantData } from '@/lib/api/types';

interface CompanyInfoStepProps {
  data: Partial<CreateTenantData>;
  updateData: (data: Partial<CreateTenantData>) => void;
}

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'Construction',
  'Transportation',
  'Other',
];

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const countries = ['Indonesia', 'Singapore', 'Malaysia', 'Thailand', 'Philippines'];
const timezones = ['Asia/Jakarta', 'Asia/Singapore', 'Asia/Kuala_Lumpur', 'Asia/Bangkok', 'Asia/Manila'];
const currencies = [
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
];

export function CompanyInfoStep({ data, updateData }: CompanyInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Company Information
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter the basic details about the company
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <Input
          label="Company Name"
          placeholder="PT Maju Bersama"
          value={data.companyName}
          onValueChange={(value) => updateData({ companyName: value })}
          isRequired
          classNames={{
            label: 'text-sm font-medium',
          }}
        />

        {/* Industry */}
        <Select
          label="Industry"
          placeholder="Select industry"
          selectedKeys={data.industry ? [data.industry] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateData({ industry: value });
          }}
          isRequired
          classNames={{
            label: 'text-sm font-medium',
          }}
        >
          {industries.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>
          ))}
        </Select>

        {/* Company Size */}
        <Select
          label="Company Size"
          placeholder="Select company size"
          selectedKeys={data.companySize ? [data.companySize] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateData({ companySize: value as CreateTenantData['companySize'] });
          }}
          isRequired
          classNames={{
            label: 'text-sm font-medium',
          }}
        >
          {companySizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </Select>

        {/* Country */}
        <Select
          label="Country"
          placeholder="Select country"
          selectedKeys={data.country ? [data.country] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateData({ country: value });
          }}
          isRequired
          classNames={{
            label: 'text-sm font-medium',
          }}
        >
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </Select>

        {/* Timezone */}
        <Select
          label="Timezone"
          placeholder="Select timezone"
          selectedKeys={data.timezone ? [data.timezone] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateData({ timezone: value });
          }}
          isRequired
          classNames={{
            label: 'text-sm font-medium',
          }}
        >
          {timezones.map((timezone) => (
            <SelectItem key={timezone} value={timezone}>
              {timezone}
            </SelectItem>
          ))}
        </Select>

        {/* Currency */}
        <Select
          label="Currency"
          placeholder="Select currency"
          selectedKeys={data.currency ? [data.currency] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            updateData({ currency: value });
          }}
          isRequired
          classNames={{
            label: 'text-sm font-medium',
          }}
        >
          {currencies.map((currency) => (
            <SelectItem key={currency.value} value={currency.value}>
              {currency.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}
