'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Mail,
  Search,
  Download,
  Send,
  UserPlus,
  UserMinus,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function NewsletterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - replace with actual API call
  const subscribers = [
    {
      id: '1',
      email: 'budi.santoso@ptmaju.com',
      status: 'active',
      source: 'website',
      subscribed_at: '2025-11-15T10:30:00Z',
    },
    {
      id: '2',
      email: 'siti.rahayu@techstartup.id',
      status: 'active',
      source: 'blog',
      subscribed_at: '2025-11-14T14:20:00Z',
    },
    {
      id: '3',
      email: 'ahmad.wijaya@retailbesar.co.id',
      status: 'active',
      source: 'demo_form',
      subscribed_at: '2025-11-12T09:15:00Z',
    },
    {
      id: '4',
      email: 'lisa.permata@manufacturing.com',
      status: 'unsubscribed',
      source: 'website',
      subscribed_at: '2025-11-10T16:45:00Z',
      unsubscribed_at: '2025-11-17T10:00:00Z',
    },
    {
      id: '5',
      email: 'john.doe@example.com',
      status: 'bounced',
      source: 'website',
      subscribed_at: '2025-11-08T11:20:00Z',
    },
  ];

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch = subscriber.email
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600 mt-2">Manage your email subscribers</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-talixa-blue text-white rounded-lg hover:bg-talixa-blue-700">
            <Send className="h-4 w-4" />
            Send Campaign
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Subscribers"
          value="1,432"
          change="+23%"
          icon={<Mail />}
          color="blue"
        />
        <StatCard
          label="Active"
          value="1,389"
          change="+18%"
          icon={<UserPlus />}
          color="green"
        />
        <StatCard
          label="Unsubscribed"
          value="38"
          change="-5%"
          icon={<UserMinus />}
          color="gray"
        />
        <StatCard
          label="Open Rate"
          value="42.3%"
          change="+3.2%"
          icon={<TrendingUp />}
          color="purple"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscribers ({filteredSubscribers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Source
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Subscribed
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={subscriber.status} />
                    </td>
                    <td className="py-4 px-4">
                      <SourceBadge source={subscriber.source} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(subscriber.subscribed_at).toLocaleDateString('id-ID')}
                        </div>
                        {subscriber.unsubscribed_at && (
                          <div className="text-xs text-gray-500">
                            Unsubscribed:{' '}
                            {new Date(subscriber.unsubscribed_at).toLocaleDateString('id-ID')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {subscriber.status === 'active' ? (
                          <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                            Unsubscribe
                          </button>
                        ) : (
                          <button className="px-3 py-1 text-sm text-talixa-blue hover:bg-talixa-blue-50 rounded-lg">
                            Resubscribe
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <CampaignRow
              title="Monthly HR Updates - November 2025"
              sent_at="2025-11-15"
              recipients={1389}
              open_rate={45.2}
              click_rate={12.8}
            />
            <CampaignRow
              title="New Feature Announcement: AI Payroll"
              sent_at="2025-11-08"
              recipients={1365}
              open_rate={52.1}
              click_rate={18.5}
            />
            <CampaignRow
              title="Talixa Product Update - October 2025"
              sent_at="2025-10-15"
              recipients={1298}
              open_rate={41.8}
              click_rate={11.2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
  color,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) {
  const isPositive = change.startsWith('+');
  const colorClasses = {
    blue: 'bg-talixa-blue-50 text-talixa-blue',
    green: 'bg-talixa-green-50 text-talixa-green',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-talixa-purple-50 text-talixa-purple',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">{label}</p>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {React.cloneElement(icon as React.ReactElement, {
              className: 'h-4 w-4',
            })}
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 text-green-800' },
    unsubscribed: { label: 'Unsubscribed', className: 'bg-gray-100 text-gray-800' },
    bounced: { label: 'Bounced', className: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const sourceConfig = {
    website: { label: 'Website', className: 'bg-blue-50 text-blue-700' },
    blog: { label: 'Blog', className: 'bg-purple-50 text-purple-700' },
    demo_form: { label: 'Demo Form', className: 'bg-green-50 text-green-700' },
  };

  const config = sourceConfig[source as keyof typeof sourceConfig] || {
    label: source,
    className: 'bg-gray-50 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function CampaignRow({
  title,
  sent_at,
  recipients,
  open_rate,
  click_rate,
}: {
  title: string;
  sent_at: string;
  recipients: number;
  open_rate: number;
  click_rate: number;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Sent: {new Date(sent_at).toLocaleDateString('id-ID')}</span>
          <span>•</span>
          <span>{recipients.toLocaleString()} recipients</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Open Rate</p>
          <p className="text-lg font-semibold text-talixa-blue">{open_rate}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Click Rate</p>
          <p className="text-lg font-semibold text-talixa-green">{click_rate}%</p>
        </div>
        <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
          View Report
        </button>
      </div>
    </div>
  );
}
