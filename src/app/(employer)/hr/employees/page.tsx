import { Suspense } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { EmployeeListTable } from '@/components/hr/EmployeeListTable';
import { EmployeeSearchFilter } from '@/components/hr/EmployeeSearchFilter';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Employees | HRIS Platform',
  description: 'Manage your employees',
};

interface PageProps {
  searchParams: {
    search?: string;
    status?: string;
    department?: string;
    position?: string;
    employmentType?: string;
    page?: string;
  };
}

export default async function EmployeesPage({ searchParams }: PageProps) {
  return (
    <PageContainer title="Employees" description="Manage your employees and their information">
      <div className="flex flex-col gap-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <EmployeeSearchFilter />
          <div className="flex gap-2">
            <Button
              as={Link}
              href="/hr/employees/new"
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
            >
              Add Employee
            </Button>
          </div>
        </div>

        {/* Employee Table */}
        <Suspense fallback={<div className="flex items-center justify-center py-12">Loading...</div>}>
          <EmployeeListTable searchParams={searchParams} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
