'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { WorkflowBuilder } from '@/components/workflows/WorkflowBuilder';
import { Button } from '@heroui/react';
import { Save, Play, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function WorkflowBuilderPage() {
  const router = useRouter();

  const handleSave = () => {
    toast.success('Workflow saved successfully');
  };

  const handleTest = () => {
    toast.info('Running workflow test...');
  };

  return (
    <PageContainer
      title="Workflow Builder"
      subtitle="Design custom approval workflows with visual editor"
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            startContent={<X className="h-4 w-4" />}
            onPress={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="flat"
            startContent={<Play className="h-4 w-4" />}
            onPress={handleTest}
          >
            Test
          </Button>
          <Button
            color="primary"
            startContent={<Save className="h-4 w-4" />}
            onPress={handleSave}
          >
            Save Workflow
          </Button>
        </div>
      }
    >
      <WorkflowBuilder />
    </PageContainer>
  );
}
