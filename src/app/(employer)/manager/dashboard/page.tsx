'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { ManagerDashboardEnhanced } from '@/components/manager/ManagerDashboardEnhanced';

export default function ManagerDashboardPage() {
  return (
    <PageContainer
      title="Manager Dashboard"
      subtitle="Team overview, pending approvals, and quick actions"
    >
      <ManagerDashboardEnhanced />
    </PageContainer>
  );
}
