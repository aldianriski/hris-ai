'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { MyDocumentsCenter } from '@/components/employee/MyDocumentsCenter';

export default function MyDocumentsPage() {
  return (
    <PageContainer
      title="My Documents"
      subtitle="Access all your employment documents, payslips, contracts, and certificates"
    >
      <MyDocumentsCenter />
    </PageContainer>
  );
}
