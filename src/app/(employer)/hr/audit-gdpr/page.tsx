'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { AuditTrailViewer } from '@/components/compliance/AuditTrailViewer';
import { GDPRCompliance } from '@/components/compliance/GDPRCompliance';
import { Tabs, Tab } from '@heroui/react';
import { useState } from 'react';
import { Shield, Activity } from 'lucide-react';

export default function AuditGDPRPage() {
  const [activeTab, setActiveTab] = useState('audit');

  return (
    <PageContainer
      title="Audit & GDPR Compliance"
      subtitle="Advanced audit trails, GDPR compliance, and data protection"
    >
      <div className="space-y-6">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          size="lg"
          color="primary"
          variant="underlined"
        >
          <Tab
            key="audit"
            title={
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Audit Trail</span>
              </div>
            }
          />
          <Tab
            key="gdpr"
            title={
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>GDPR & Privacy</span>
              </div>
            }
          />
        </Tabs>

        {activeTab === 'audit' && <AuditTrailViewer />}
        {activeTab === 'gdpr' && <GDPRCompliance />}
      </div>
    </PageContainer>
  );
}
