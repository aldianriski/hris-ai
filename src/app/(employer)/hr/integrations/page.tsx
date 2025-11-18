'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { IntegrationMarketplace } from '@/components/integrations/IntegrationMarketplace';
import { WebhookManagement } from '@/components/integrations/WebhookManagement';
import { APIDeveloperPortal } from '@/components/integrations/APIDeveloperPortal';
import { Tabs, Tab } from '@heroui/react';
import { useState } from 'react';
import { Zap, Webhook, Code2 } from 'lucide-react';

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('marketplace');

  return (
    <PageContainer
      title="Integration Marketplace"
      subtitle="Connect your HRIS with external platforms and build custom integrations"
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
            key="marketplace"
            title={
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Marketplace</span>
              </div>
            }
          />
          <Tab
            key="webhooks"
            title={
              <div className="flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                <span>Webhooks</span>
              </div>
            }
          />
          <Tab
            key="api"
            title={
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                <span>API & Developer</span>
              </div>
            }
          />
        </Tabs>

        {activeTab === 'marketplace' && <IntegrationMarketplace />}
        {activeTab === 'webhooks' && <WebhookManagement />}
        {activeTab === 'api' && <APIDeveloperPortal />}
      </div>
    </PageContainer>
  );
}
