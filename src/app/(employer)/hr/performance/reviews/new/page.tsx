import { PageContainer } from '@/components/ui/PageContainer';
import { PerformanceReviewForm } from '@/components/hr/PerformanceReviewForm';

export const metadata = {
  title: 'New Performance Review | HRIS Platform',
  description: 'Create a new performance review',
};

export default function NewPerformanceReviewPage() {
  return (
    <PageContainer
      title="New Performance Review"
      description="Conduct a performance review for an employee"
    >
      <PerformanceReviewForm mode="create" />
    </PageContainer>
  );
}
