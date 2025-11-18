'use client';

import { useState, useEffect } from 'react';
import { Spinner, Tabs, Tab } from '@heroui/react';
import { TenantHealthWidget } from '@/components/platform/analytics/TenantHealthWidget';
import { FeatureAdoptionWidget } from '@/components/platform/analytics/FeatureAdoptionWidget';
import { UserEngagementWidget } from '@/components/platform/analytics/UserEngagementWidget';
import { AlertCircle, TrendingUp, Users, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedAnalytics {
  tenantHealth: any[];
  featureAdoption: any[];
  userEngagement: any;
}

export default function AdvancedAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, []);

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform/analytics/advanced');

      if (!response.ok) {
        throw new Error('Failed to fetch advanced analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching advanced analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      toast.error('Failed to load advanced analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p>{error || 'Failed to load analytics'}</p>
        </div>
        <button
          onClick={fetchAdvancedAnalytics}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Advanced Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Deep insights into tenant health, feature adoption, and user engagement
        </p>
      </div>

      {/* Tabs for Different Analytics Views */}
      <Tabs
        aria-label="Analytics views"
        classNames={{
          tabList: 'w-full relative rounded-none border-b border-gray-200 dark:border-gray-700',
          cursor: 'w-full bg-primary',
          tab: 'max-w-fit px-6 h-12',
          tabContent: 'group-data-[selected=true]:text-primary'
        }}
      >
        <Tab
          key="tenant-health"
          title={
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Tenant Health</span>
            </div>
          }
        >
          <div className="py-6">
            <TenantHealthWidget
              tenants={analytics.tenantHealth}
              showTop={10}
            />
          </div>
        </Tab>

        <Tab
          key="feature-adoption"
          title={
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Feature Adoption</span>
            </div>
          }
        >
          <div className="py-6">
            <FeatureAdoptionWidget features={analytics.featureAdoption} />
          </div>
        </Tab>

        <Tab
          key="user-engagement"
          title={
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>User Engagement</span>
            </div>
          }
        >
          <div className="py-6">
            <UserEngagementWidget engagement={analytics.userEngagement} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
