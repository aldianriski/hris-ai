'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { OnboardingWorkflow } from '@/components/workflows/OnboardingWorkflow';
import { Button } from '@heroui/react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingWorkflowPage() {
  const router = useRouter();

  return (
    <PageContainer
      title="Automated Onboarding Workflow"
      subtitle="Streamlined onboarding process from pre-boarding to first month milestones"
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
      <OnboardingWorkflow />
    </PageContainer>
  );
}
