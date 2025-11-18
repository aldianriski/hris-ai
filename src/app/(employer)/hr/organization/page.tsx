import { PageContainer } from '@/components/ui/PageContainer';
import { OrgChartPlaceholder } from '@/components/hr/OrgChartPlaceholder';

export const metadata = {
  title: 'Organization Chart | HRIS Platform',
  description: 'View organizational structure',
};

export default function OrganizationPage() {
  return (
    <PageContainer
      title="Organization Chart"
      description="Visualize your organizational structure and reporting lines"
    >
      <OrgChartPlaceholder />
    </PageContainer>
  );
}
