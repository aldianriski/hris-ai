'use client';

import { Card, CardHeader, CardBody, Button, Chip, Tabs, Tab, Input } from '@heroui/react';
import { Search, Zap, CheckCircle, Settings, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface Integration {
  id: string;
  name: string;
  slug: string;
  category: string;
  provider: string;
  description: string;
  logoUrl: string;
  pricingModel: 'free' | 'paid' | 'freemium';
  features: string[];
  isInstalled: boolean;
  status?: 'active' | 'inactive' | 'error';
}

export function IntegrationMarketplace() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API
  const integrations: Integration[] = [
    // Hiring Platforms
    {
      id: '1',
      name: 'Glints',
      slug: 'glints',
      category: 'hiring',
      provider: 'Glints',
      description: 'Sync candidates from Glints to HRIS automatically',
      logoUrl: 'https://logo.clearbit.com/glints.com',
      pricingModel: 'free',
      features: ['Auto-sync candidates', 'Application tracking', 'Interview scheduling'],
      isInstalled: true,
      status: 'active',
    },
    {
      id: '2',
      name: 'JobStreet',
      slug: 'jobstreet',
      category: 'hiring',
      provider: 'JobStreet',
      description: 'Import applications from JobStreet Indonesia',
      logoUrl: 'https://logo.clearbit.com/jobstreet.co.id',
      pricingModel: 'free',
      features: ['Candidate import', 'Status updates', 'Resume parsing'],
      isInstalled: false,
    },
    {
      id: '3',
      name: 'LinkedIn Recruiter',
      slug: 'linkedin-recruiter',
      category: 'hiring',
      provider: 'LinkedIn',
      description: 'Connect LinkedIn Recruiter with HRIS',
      logoUrl: 'https://logo.clearbit.com/linkedin.com',
      pricingModel: 'paid',
      features: ['Candidate sync', 'Messaging integration', 'Profile import'],
      isInstalled: false,
    },

    // Accounting
    {
      id: '4',
      name: 'Accurate Online',
      slug: 'accurate-online',
      category: 'accounting',
      provider: 'CPSSoft',
      description: 'Sync payroll to Accurate accounting software',
      logoUrl: 'https://logo.clearbit.com/accurate.id',
      pricingModel: 'freemium',
      features: ['Payroll journal entries', 'Tax reporting', 'Employee cost tracking'],
      isInstalled: true,
      status: 'active',
    },
    {
      id: '5',
      name: 'Jurnal',
      slug: 'jurnal',
      category: 'accounting',
      provider: 'Mekari',
      description: 'Integrate with Jurnal accounting platform',
      logoUrl: 'https://logo.clearbit.com/jurnal.id',
      pricingModel: 'freemium',
      features: ['Automated journal entries', 'Financial reporting', 'Multi-currency support'],
      isInstalled: false,
    },

    // Communication
    {
      id: '6',
      name: 'Slack',
      slug: 'slack',
      category: 'communication',
      provider: 'Slack',
      description: 'Send HRIS notifications to Slack channels',
      logoUrl: 'https://logo.clearbit.com/slack.com',
      pricingModel: 'free',
      features: ['Leave approvals', 'Birthday reminders', 'Onboarding notifications'],
      isInstalled: true,
      status: 'active',
    },
    {
      id: '7',
      name: 'Microsoft Teams',
      slug: 'microsoft-teams',
      category: 'communication',
      provider: 'Microsoft',
      description: 'Teams integration for HR notifications',
      logoUrl: 'https://logo.clearbit.com/microsoft.com',
      pricingModel: 'free',
      features: ['Approval workflows', 'Announcements', '1-on-1 scheduling'],
      isInstalled: false,
    },
    {
      id: '8',
      name: 'WhatsApp Business',
      slug: 'whatsapp-business',
      category: 'communication',
      provider: 'Meta',
      description: 'WhatsApp Business API for HR messaging',
      logoUrl: 'https://logo.clearbit.com/whatsapp.com',
      pricingModel: 'paid',
      features: ['Automated messages', 'Leave notifications', 'Attendance reminders'],
      isInstalled: false,
    },

    // Learning
    {
      id: '9',
      name: 'Udemy Business',
      slug: 'udemy-business',
      category: 'learning',
      provider: 'Udemy',
      description: 'Track employee learning from Udemy Business',
      logoUrl: 'https://logo.clearbit.com/udemy.com',
      pricingModel: 'paid',
      features: ['Course completion tracking', 'Learning hours', 'Certification import'],
      isInstalled: false,
    },
    {
      id: '10',
      name: 'LinkedIn Learning',
      slug: 'linkedin-learning',
      category: 'learning',
      provider: 'LinkedIn',
      description: 'LinkedIn Learning content integration',
      logoUrl: 'https://logo.clearbit.com/linkedin.com',
      pricingModel: 'paid',
      features: ['Learning paths', 'Skill development', 'Certificate tracking'],
      isInstalled: false,
    },

    // Background Check
    {
      id: '11',
      name: 'VerifyID',
      slug: 'verifyid',
      category: 'background_check',
      provider: 'VerifyID',
      description: 'Indonesian background verification service',
      logoUrl: 'https://logo.clearbit.com/verifyid.co.id',
      pricingModel: 'paid',
      features: ['KTP verification', 'Criminal record check', 'Employment verification'],
      isInstalled: false,
    },
  ];

  const categories = [
    { key: 'all', label: 'All Integrations', count: integrations.length },
    { key: 'hiring', label: 'Hiring Platforms', count: integrations.filter(i => i.category === 'hiring').length },
    { key: 'accounting', label: 'Accounting', count: integrations.filter(i => i.category === 'accounting').length },
    { key: 'communication', label: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { key: 'learning', label: 'Learning', count: integrations.filter(i => i.category === 'learning').length },
    { key: 'background_check', label: 'Background Check', count: integrations.filter(i => i.category === 'background_check').length },
  ];

  const filterIntegrations = (integrations: Integration[]) => {
    let filtered = integrations;

    if (activeTab !== 'all') {
      filtered = filtered.filter(i => i.category === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredIntegrations = filterIntegrations(integrations);
  const installedCount = integrations.filter(i => i.isInstalled).length;

  const getPricingColor = (model: string) => {
    const colors: Record<string, 'success' | 'primary' | 'warning'> = {
      free: 'success',
      paid: 'primary',
      freemium: 'warning',
    };
    return colors[model] || 'default';
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, 'success' | 'danger' | 'default'> = {
      active: 'success',
      inactive: 'default',
      error: 'danger',
    };
    return colors[status || 'default'] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{integrations.length}</p>
                  <p className="text-sm text-default-500">Available Integrations</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success-50 dark:bg-success-100/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{installedCount}</p>
                  <p className="text-sm text-default-500">Active Integrations</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-100/10 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-default-500">Categories</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search className="h-4 w-4 text-default-400" />}
              className="flex-1"
              size="lg"
            />
          </div>
        </CardBody>
      </Card>

      {/* Categories Tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        size="lg"
        color="primary"
        variant="underlined"
      >
        {categories.map(cat => (
          <Tab
            key={cat.key}
            title={
              <div className="flex items-center gap-2">
                <span>{cat.label}</span>
                <Chip size="sm" variant="flat">{cat.count}</Chip>
              </div>
            }
          />
        ))}
      </Tabs>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={integration.isInstalled ? 'border-2 border-success' : ''}>
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-default-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-xs text-default-500">{integration.provider}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Chip
                      color={getPricingColor(integration.pricingModel)}
                      variant="flat"
                      size="sm"
                      className="capitalize"
                    >
                      {integration.pricingModel}
                    </Chip>
                    {integration.isInstalled && integration.status && (
                      <Chip
                        color={getStatusColor(integration.status)}
                        variant="flat"
                        size="sm"
                        startContent={<CheckCircle className="h-3 w-3" />}
                      >
                        {integration.status}
                      </Chip>
                    )}
                  </div>
                </div>

                <p className="text-sm text-default-600 mb-4">{integration.description}</p>

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-default-500">Features:</p>
                  {integration.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span className="text-xs text-default-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {integration.isInstalled ? (
                    <>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<Settings className="h-4 w-4" />}
                        fullWidth
                      >
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="bordered"
                        color="danger"
                        fullWidth
                      >
                        Uninstall
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        color="primary"
                        startContent={<Zap className="h-4 w-4" />}
                        fullWidth
                      >
                        Install
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="bordered"
                        startContent={<ExternalLink className="h-4 w-4" />}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-16 w-16 mx-auto text-default-300 mb-4" />
          <p className="text-default-500">No integrations found</p>
          <p className="text-sm text-default-400 mt-2">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
