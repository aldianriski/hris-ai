import { PageContainer } from '@/components/ui/PageContainer';
import { ComplianceDashboard } from '@/components/hr/ComplianceDashboard';

export const metadata = {
  title: 'Compliance Dashboard | HRIS Platform',
  description: 'Monitor compliance and regulatory requirements',
};

export default function CompliancePage() {
  return (
    <PageContainer
      title="Compliance Dashboard"
      description="Monitor contract expiry, BPJS compliance, and audit logs"
    >
      <ComplianceDashboard />
    </PageContainer>
  );
}
