import { PageContainer } from '@/components/ui/PageContainer';
import { AttendanceAnomalyDashboard } from '@/components/hr/AttendanceAnomalyDashboard';

export const metadata = {
  title: 'Attendance Anomalies | HRIS Platform',
  description: 'AI-detected attendance anomalies and fraud prevention',
};

export default function AttendanceAnomaliesPage() {
  return (
    <PageContainer
      title="Attendance Anomaly Detection"
      description="AI-powered detection of attendance fraud and unusual patterns"
    >
      <AttendanceAnomalyDashboard />
    </PageContainer>
  );
}
