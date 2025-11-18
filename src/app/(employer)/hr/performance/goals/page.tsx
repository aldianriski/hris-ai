import { Suspense } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { GoalsList } from '@/components/hr/GoalsList';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Goals & OKRs | HRIS Platform',
  description: 'Manage employee goals, OKRs, and KPIs',
};

export default function GoalsPage() {
  return (
    <PageContainer
      title="Goals & OKRs"
      description="Set and track employee objectives and key results"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track progress on OKRs and KPIs
          </p>
          <Button
            as={Link}
            href="/hr/performance/goals/new"
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
          >
            New Goal
          </Button>
        </div>

        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <GoalsList />
        </Suspense>
      </div>
    </PageContainer>
  );
}
