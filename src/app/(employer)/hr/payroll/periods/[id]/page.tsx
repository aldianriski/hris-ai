import { Suspense } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { payrollService } from '@/lib/api/services';
import { PayrollPeriodDetail } from '@/components/hr/PayrollPeriodDetail';
import { format } from 'date-fns';

export const metadata = {
  title: 'Payroll Period Details | HRIS Platform',
  description: 'View and manage payroll period details',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PayrollPeriodDetailPage({ params }: PageProps) {
  const period = await payrollService.getPeriodById(params.id);
  const monthYear = format(new Date(period.periodStart), 'MMMM yyyy');

  return (
    <PageContainer
      title={`Payroll - ${monthYear}`}
      description={`${format(new Date(period.periodStart), 'MMM dd')} - ${format(
        new Date(period.periodEnd),
        'MMM dd, yyyy'
      )}`}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            Loading payroll details...
          </div>
        }
      >
        <PayrollPeriodDetail period={period} />
      </Suspense>
    </PageContainer>
  );
}
