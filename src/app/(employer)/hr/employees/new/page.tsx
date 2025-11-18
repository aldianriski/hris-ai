import { PageContainer } from '@/components/ui/PageContainer';
import { EmployeeForm } from '@/components/forms/EmployeeForm';

export const metadata = {
  title: 'Add New Employee | HRIS Platform',
  description: 'Add a new employee to your organization',
};

export default function NewEmployeePage() {
  return (
    <PageContainer
      title="Add New Employee"
      description="Fill in the employee information below"
    >
      <EmployeeForm mode="create" />
    </PageContainer>
  );
}
