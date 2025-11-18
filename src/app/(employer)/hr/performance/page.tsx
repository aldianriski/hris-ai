import { Suspense } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { PerformanceReviewList } from '@/components/hr/PerformanceReviewList';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Performance Management | HRIS Platform',
  description: 'Manage employee performance reviews and goals',
};

export default async function PerformancePage() {
  return (
    <PageContainer
      title="Performance Management"
      description="Conduct performance reviews, set goals, and track employee development"
    >
      <div className="flex flex-col gap-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Create reviews, provide feedback, and monitor progress
          </div>
          <Button
            as={Link}
            href="/hr/performance/reviews/new"
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
          >
            New Review
          </Button>
        </div>

        {/* Reviews List */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              Loading performance reviews...
            </div>
          }
        >
          <PerformanceReviewList />
        </Suspense>
      </div>
    </PageContainer>
  );
}
