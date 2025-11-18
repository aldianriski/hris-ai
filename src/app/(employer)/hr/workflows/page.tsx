'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { WorkflowList } from '@/components/workflows/WorkflowList';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkflowsPage() {
  const router = useRouter();

  return (
    <PageContainer
      title="Workflow Automation"
      subtitle="Automate approval processes and business workflows"
      action={
        <Button
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => router.push('/hr/workflows/builder')}
        >
          Create Workflow
        </Button>
      }
    >
      <WorkflowList />
    </PageContainer>
  );
}
