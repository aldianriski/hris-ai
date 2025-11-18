'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { MyBenefitsDashboard } from '@/components/employee/MyBenefitsDashboard';

export default function MyBenefitsPage() {
  return (
    <PageContainer
      title="My Benefits"
      subtitle="View your BPJS, health insurance, pension, leave balance, and other benefits"
    >
      <MyBenefitsDashboard />
    </PageContainer>
  );
}
