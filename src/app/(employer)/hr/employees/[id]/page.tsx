import { PageContainer } from '@/components/ui/PageContainer';
import { employeeService } from '@/lib/api/services';
import { EmployeeDetailView } from '@/components/hr/EmployeeDetailView';

export const metadata = {
  title: 'Employee Details | HRIS Platform',
  description: 'View employee details and history',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const employee = await employeeService.getById(params.id);

  return (
    <PageContainer
      title={employee.fullName}
      description={`${employee.position} • ${employee.department}`}
    >
      <EmployeeDetailView employee={employee} />
    </PageContainer>
  );
}
