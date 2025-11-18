'use client';

import { useState } from 'react';
import { Tabs, Tab, Button, Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Edit, MoreVertical, Download, UserX, FileText } from 'lucide-react';
import { Employee } from '@/lib/api/types';
import { EmployeeProfile } from './EmployeeProfile';
import { EmployeeTimeline } from './EmployeeTimeline';
import { EmployeeDocumentsList } from './EmployeeDocumentsList';
import { EmployeeAttendanceSummary } from './EmployeeAttendanceSummary';
import { EmployeePayrollHistory } from './EmployeePayrollHistory';
import { EmployeePerformanceHistory } from './EmployeePerformanceHistory';
import Link from 'next/link';

interface EmployeeDetailViewProps {
  employee: Employee;
}

export function EmployeeDetailView({ employee }: EmployeeDetailViewProps) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            as={Link}
            href={`/hr/employees/${employee.id}/edit`}
            color="primary"
            startContent={<Edit className="w-4 h-4" />}
          >
            Edit Employee
          </Button>
          <Button
            variant="bordered"
            startContent={<FileText className="w-4 h-4" />}
          >
            Print Contract
          </Button>
        </div>

        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="bordered">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Employee actions">
            <DropdownItem
              key="export"
              startContent={<Download className="w-4 h-4" />}
            >
              Export Data
            </DropdownItem>
            <DropdownItem
              key="terminate"
              className="text-danger"
              color="danger"
              startContent={<UserX className="w-4 h-4" />}
            >
              Terminate Employee
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-1">
          <EmployeeTimeline employeeId={employee.id} />
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                aria-label="Employee details tabs"
                classNames={{
                  tabList: 'w-full',
                  cursor: 'bg-primary',
                }}
              >
                <Tab key="profile" title="Profile">
                  <div className="py-6">
                    <EmployeeProfile employee={employee} />
                  </div>
                </Tab>
                <Tab key="documents" title="Documents">
                  <div className="py-6">
                    <EmployeeDocumentsList employeeId={employee.id} />
                  </div>
                </Tab>
                <Tab key="attendance" title="Attendance">
                  <div className="py-6">
                    <EmployeeAttendanceSummary employeeId={employee.id} />
                  </div>
                </Tab>
                <Tab key="performance" title="Performance">
                  <div className="py-6">
                    <EmployeePerformanceHistory employeeId={employee.id} />
                  </div>
                </Tab>
                <Tab key="payroll" title="Payroll">
                  <div className="py-6">
                    <EmployeePayrollHistory employeeId={employee.id} />
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
