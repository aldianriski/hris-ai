'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, Tabs, Tab, Button, Chip } from '@heroui/react';
import {
  ArrowLeft,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  FileText,
  LifeBuoy,
  Edit,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { TenantOverviewTab } from './tenant-detail-tabs/TenantOverviewTab';
import { TenantUsersTab } from './tenant-detail-tabs/TenantUsersTab';
import { TenantBillingTab } from './tenant-detail-tabs/TenantBillingTab';
import { TenantUsageTab } from './tenant-detail-tabs/TenantUsageTab';
import { TenantSettingsTab } from './tenant-detail-tabs/TenantSettingsTab';
import { TenantAuditLogsTab } from './tenant-detail-tabs/TenantAuditLogsTab';
import { TenantSupportTab } from './tenant-detail-tabs/TenantSupportTab';

interface TenantDetailViewProps {
  tenantId: string;
}

// Mock data - will be replaced with real API call
const mockTenant = {
  id: '1',
  companyName: 'PT Maju Bersama',
  slug: 'maju-bersama',
  industry: 'Technology',
  companySize: '51-200',
  primaryAdmin: {
    id: '1',
    firstName: 'Budi',
    lastName: 'Santoso',
    email: 'budi@majubersama.com',
  },
  subscriptionPlan: 'professional',
  subscriptionStatus: 'active',
  currentEmployeeCount: 45,
  maxEmployees: 200,
  status: 'active',
  logoUrl: null,
  primaryColor: '#6366f1',
  createdAt: '2024-10-15T10:30:00Z',
};

const statusColors = {
  active: 'success',
  trial: 'primary',
  suspended: 'warning',
  cancelled: 'danger',
} as const;

const planBadgeColors = {
  trial: 'default',
  starter: 'primary',
  professional: 'secondary',
  enterprise: 'success',
} as const;

export function TenantDetailView({ tenantId }: TenantDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // TODO: Fetch tenant data from API
  const tenant = mockTenant;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/(platform-admin)/tenants">
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              aria-label="Back to tenants"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {tenant.companyName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {tenant.slug}
                </span>
                <Chip
                  size="sm"
                  color={statusColors[tenant.subscriptionStatus as keyof typeof statusColors]}
                  variant="flat"
                >
                  {tenant.subscriptionStatus}
                </Chip>
                <Chip
                  size="sm"
                  color={planBadgeColors[tenant.subscriptionPlan as keyof typeof planBadgeColors]}
                  variant="flat"
                >
                  {tenant.subscriptionPlan}
                </Chip>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            startContent={<Edit className="w-4 h-4" />}
            size="sm"
          >
            Edit
          </Button>
          {tenant.status === 'active' ? (
            <Button
              variant="flat"
              color="warning"
              startContent={<PauseCircle className="w-4 h-4" />}
              size="sm"
            >
              Suspend
            </Button>
          ) : (
            <Button
              variant="flat"
              color="success"
              startContent={<PlayCircle className="w-4 h-4" />}
              size="sm"
            >
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            classNames={{
              tabList: 'w-full relative rounded-none p-0 border-b border-gray-200 dark:border-gray-700',
              cursor: 'w-full bg-primary',
              tab: 'max-w-fit px-6 h-12',
              tabContent: 'group-data-[selected=true]:text-primary'
            }}
          >
            <Tab
              key="overview"
              title={
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Overview</span>
                </div>
              }
            >
              <div className="p-6">
                <TenantOverviewTab tenant={tenant} />
              </div>
            </Tab>

            <Tab
              key="users"
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </div>
              }
            >
              <div className="p-6">
                <TenantUsersTab tenantId={tenantId} />
              </div>
            </Tab>

            <Tab
              key="billing"
              title={
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Billing</span>
                </div>
              }
            >
              <div className="p-6">
                <TenantBillingTab tenant={tenant} />
              </div>
            </Tab>

            <Tab
              key="usage"
              title={
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Usage</span>
                </div>
              }
            >
              <div className="p-6">
                <TenantUsageTab tenant={tenant} />
              </div>
            </Tab>

            <Tab
              key="settings"
              title={
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </div>
              }
            >
              <div className="p-6">
                <TenantSettingsTab tenant={tenant} />
              </div>
            </Tab>

            <Tab
              key="audit"
              title={
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Audit Logs</span>
                </div>
              }
            >
              <div className="p-6">
                <TenantAuditLogsTab tenantId={tenantId} />
              </div>
            </Tab>

            <Tab
              key="support"
              title={
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4" />
                  <span>Support</span>
                </div>
              }
            >
              <div className="p-6">
                <TenantSupportTab tenantId={tenantId} />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
