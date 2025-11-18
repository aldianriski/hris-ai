import { PageContainer } from '@/components/ui/PageContainer';
import { EmployeeForm } from '@/components/forms/EmployeeForm';
import { employeeService } from '@/lib/api/services';

export const metadata = {
  title: 'Edit Employee | HRIS Platform',
  description: 'Update employee information',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditEmployeePage({ params }: PageProps) {
  // Fetch employee data
  const employee = await employeeService.getById(params.id);

  return (
    <PageContainer
      title="Edit Employee"
      description={`Update information for ${employee.fullName}`}
    >
      <EmployeeForm mode="edit" employeeId={params.id} initialData={employee} />
    </PageContainer>
  );
}
