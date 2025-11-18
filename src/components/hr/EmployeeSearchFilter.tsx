'use client';

import { Input, Select, SelectItem, Button } from '@heroui/react';
import { Search, Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const EMPLOYMENT_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
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

export function EmployeeSearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Update URL with search params
  const updateFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (employmentType) params.set('employmentType', employmentType);

    router.push(`/hr/employees?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setEmploymentType('');
    router.push('/hr/employees');
  };

  const hasActiveFilters = search || status || employmentType;

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex gap-2 items-center">
        {/* Search Input */}
        <Input
          className="flex-1 max-w-md"
          placeholder="Search by name, employee number, email..."
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
        />

        {/* Filter Toggle Button */}
        <Button
          variant={showFilters ? 'solid' : 'bordered'}
          color={showFilters ? 'primary' : 'default'}
          startContent={<Filter className="w-4 h-4" />}
          onPress={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>

        {/* Apply Button */}
        <Button color="primary" onPress={updateFilters}>
          Apply
        </Button>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button
            variant="light"
            color="danger"
            startContent={<X className="w-4 h-4" />}
            onPress={clearFilters}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Select
            label="Employment Status"
            placeholder="Select status"
            selectedKeys={status ? [status] : []}
            onChange={(e) => setStatus(e.target.value)}
          >
            {EMPLOYMENT_STATUS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Employment Type"
            placeholder="Select type"
            selectedKeys={employmentType ? [employmentType] : []}
            onChange={(e) => setEmploymentType(e.target.value)}
          >
            {EMPLOYMENT_TYPES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </Select>

          <div className="flex items-end">
            <Button
              fullWidth
              variant="flat"
              color="primary"
              onPress={updateFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
