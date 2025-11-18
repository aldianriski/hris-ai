'use client';

import { PageContainer } from '@/components/ui/PageContainer';
import { ExecutiveDashboard } from '@/components/analytics/ExecutiveDashboard';
import { HRAnalyticsHub } from '@/components/analytics/HRAnalyticsHub';
import { PredictiveInsights } from '@/components/analytics/PredictiveInsights';
import { Tabs, Tab } from '@heroui/react';
import { useState } from 'react';
import { BarChart3, TrendingUp, Brain } from 'lucide-react';

export default function HRAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('executive');

  return (
    <PageContainer
      title="HR Analytics"
      subtitle="Data-driven insights for strategic HR decisions"
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
            key="executive"
            title={
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Executive Dashboard</span>
              </div>
            }
          />
          <Tab
            key="analytics"
            title={
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analytics Hub</span>
              </div>
            }
          />
          <Tab
            key="predictive"
            title={
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span>Predictive Insights</span>
              </div>
            }
          />
        </Tabs>

        {activeTab === 'executive' && <ExecutiveDashboard />}
        {activeTab === 'analytics' && <HRAnalyticsHub />}
        {activeTab === 'predictive' && <PredictiveInsights />}
      </div>
    </PageContainer>
  );
}
