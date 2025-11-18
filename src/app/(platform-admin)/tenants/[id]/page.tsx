import { TenantDetailView } from '@/components/platform/TenantDetailView';

interface TenantDetailPageProps {
  params: {
    id: string;
  };
}

export default function TenantDetailPage({ params }: TenantDetailPageProps) {
  return <TenantDetailView tenantId={params.id} />;
}
