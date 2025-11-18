import { Suspense } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { PayrollPeriodList } from '@/components/hr/PayrollPeriodList';
import { CreatePeriodButton } from '@/components/hr/CreatePeriodButton';

export const metadata = {
  title: 'Payroll Management | HRIS Platform',
  description: 'Manage payroll periods and employee salaries',
};

interface PageProps {
  searchParams: {
    status?: string;
    year?: string;
    page?: string;
  };
}

export default async function PayrollPage({ searchParams }: PageProps) {
  return (
    <PageContainer
      title="Payroll Management"
      description="Process and manage employee payroll"
    >
      <div className="flex flex-col gap-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Manage payroll periods, process salaries, and generate payslips
          </div>
          <CreatePeriodButton />
        </div>

        {/* Payroll Period List */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              Loading payroll periods...
            </div>
          }
        >
          <PayrollPeriodList searchParams={searchParams} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
