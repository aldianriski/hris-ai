'use client';

import { Card, CardBody, Chip, Divider } from '@heroui/react';
import { Employee } from '@/lib/api/types';
import { format } from 'date-fns';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  CreditCard,
  Shield,
} from 'lucide-react';

interface EmployeeProfileProps {
  employee: Employee;
}

const STATUS_COLOR_MAP = {
  active: 'success',
  inactive: 'warning',
  terminated: 'danger',
  resigned: 'default',
} as const;

export function EmployeeProfile({ employee }: EmployeeProfileProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem icon={<Mail />} label="Email" value={employee.email} />
          <InfoItem icon={<Phone />} label="Phone" value={employee.phone} />
          <InfoItem
            icon={<Calendar />}
            label="Date of Birth"
            value={format(new Date(employee.dateOfBirth), 'MMM dd, yyyy')}
          />
          <InfoItem
            icon={<User />}
            label="Gender"
            value={employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)}
          />
          <InfoItem
            icon={<User />}
            label="Marital Status"
            value={employee.maritalStatus.charAt(0).toUpperCase() + employee.maritalStatus.slice(1)}
          />
          <InfoItem icon={<User />} label="Nationality" value={employee.nationality} />
          {employee.nationalId && (
            <InfoItem icon={<CreditCard />} label="National ID (KTP)" value={employee.nationalId} />
          )}
          {employee.taxId && (
            <InfoItem icon={<CreditCard />} label="Tax ID (NPWP)" value={employee.taxId} />
          )}
        </div>
      </div>

      <Divider />

      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <InfoItem icon={<MapPin />} label="Address" value={employee.address} />
          </div>
          <InfoItem label="City" value={employee.city} />
          <InfoItem label="Province" value={employee.province} />
          {employee.postalCode && (
            <InfoItem label="Postal Code" value={employee.postalCode} />
          )}
        </div>
      </div>

      <Divider />

      {/* Employment Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Employment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem
            icon={<CreditCard />}
            label="Employee Number"
            value={employee.employeeNumber}
          />
          <InfoItem icon={<Building />} label="Department" value={employee.department} />
          <InfoItem icon={<Briefcase />} label="Position" value={employee.position} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Employment Type</p>
            <Chip size="sm" variant="flat">
              {employee.employmentType.charAt(0).toUpperCase() + employee.employmentType.slice(1)}
            </Chip>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
            <Chip
              size="sm"
              color={STATUS_COLOR_MAP[employee.employmentStatus]}
              variant="flat"
            >
              {employee.employmentStatus.charAt(0).toUpperCase() + employee.employmentStatus.slice(1)}
            </Chip>
          </div>
          <InfoItem
            icon={<Calendar />}
            label="Join Date"
            value={format(new Date(employee.joinDate), 'MMM dd, yyyy')}
          />
          {employee.manager && (
            <InfoItem icon={<User />} label="Manager" value={employee.manager} />
          )}
          <InfoItem label="Work Location" value={employee.workLocation} />
          <InfoItem label="Work Schedule" value={employee.workSchedule} />
        </div>
      </div>

      {employee.salary && (
        <>
          <Divider />

          {/* Salary Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Compensation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Monthly Salary"
                value={`Rp ${employee.salary.toLocaleString('id-ID')}`}
              />
              <InfoItem
                label="Annual Salary"
                value={`Rp ${(employee.salary * 12).toLocaleString('id-ID')}`}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {icon && <div className="text-gray-400 mt-1">{icon}</div>}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
