'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { HelpCenter } from '@/components/help/HelpCenter';

export default function HelpPage() {
  return (
    <PageContainer
      title="Help Center"
      subtitle="Find answers to frequently asked questions and get support"
    >
      <HelpCenter />
    </PageContainer>
  );
}
