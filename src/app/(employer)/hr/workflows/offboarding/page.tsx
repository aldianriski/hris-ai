'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { OffboardingWorkflow } from '@/components/workflows/OffboardingWorkflow';
import { Button } from '@heroui/react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OffboardingWorkflowPage() {
  const router = useRouter();

  return (
    <PageContainer
      title="Automated Offboarding Workflow"
      subtitle="Comprehensive offboarding process from resignation to post-exit activities"
      action={
        <Button
          variant="flat"
          startContent={<ArrowLeft className="h-4 w-4" />}
          onPress={() => router.push('/hr/workflows')}
        >
          Back to Workflows
        </Button>
      }
    >
      <OffboardingWorkflow />
    </PageContainer>
  );
}
