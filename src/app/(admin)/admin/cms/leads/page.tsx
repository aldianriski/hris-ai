'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  Building2,
  Calendar,
  Tag
} from 'lucide-react';

export default function LeadsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Mock data - replace with actual API call
  const leads = [
    {
      id: '1',
      email: 'contact@ptmaju.com',
      name: 'Budi Santoso',
      company: 'PT Maju Bersama',
      phone: '+62 812-3456-7890',
      status: 'new',
      source: 'website',
      interest: 'Starter Plan',
      utm_source: 'google',
      utm_campaign: 'hris-search',
      created_at: '2025-11-18T10:30:00Z',
    },
    {
      id: '2',
      email: 'hr@techstartup.id',
      company: 'PT Tech Startup Indonesia',
      phone: '+62 821-9876-5432',
      status: 'contacted',
      source: 'demo_form',
      interest: 'Pro Plan',
      utm_source: 'linkedin',
      utm_campaign: 'hr-tech',
      created_at: '2025-11-17T14:20:00Z',
    },
    {
      id: '3',
      email: 'admin@retailbesar.co.id',
      name: 'Siti Rahayu',
      company: 'PT Retail Besar',
      phone: '+62 813-2468-1357',
      status: 'qualified',
      source: 'referral',
      interest: 'Enterprise Plan',
      created_at: '2025-11-16T09:15:00Z',
    },
    {
      id: '4',
      email: 'info@manufacturing.com',
      company: 'PT Manufacturing Solutions',
      status: 'converted',
      source: 'website',
      interest: 'Pro Plan',
      utm_source: 'facebook',
      utm_campaign: 'manufacturing-ads',
      created_at: '2025-11-15T16:45:00Z',
    },
  ];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-2">Manage and track your sales leads</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-talixa-blue text-white rounded-lg hover:bg-talixa-blue-700">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
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
                placeholder="Search by name, email, or company..."
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
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="demo_form">Demo Form</option>
              <option value="referral">Referral</option>
              <option value="social_media">Social Media</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value="247" color="blue" />
        <StatCard label="New" value="45" color="purple" />
        <StatCard label="Qualified" value="32" color="green" />
        <StatCard label="Converted" value="18" color="gold" />
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Source
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Interest
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {lead.name && (
                          <p className="font-medium text-gray-900">{lead.name}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {lead.company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{lead.company}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <SourceBadge source={lead.source} />
                        {lead.utm_source && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Tag className="h-3 w-3" />
                            {lead.utm_source}
                            {lead.utm_campaign && ` / ${lead.utm_campaign}`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{lead.interest}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(lead.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1 text-sm text-talixa-blue hover:bg-talixa-blue-50 rounded-lg">
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-talixa-blue',
    purple: 'text-talixa-purple',
    green: 'text-talixa-green',
    gold: 'text-talixa-gold',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-gray-600 mb-2">{label}</p>
        <p className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    new: { label: 'New', className: 'bg-blue-100 text-blue-800' },
    contacted: { label: 'Contacted', className: 'bg-purple-100 text-purple-800' },
    qualified: { label: 'Qualified', className: 'bg-green-100 text-green-800' },
    converted: { label: 'Converted', className: 'bg-talixa-gold-100 text-talixa-gold-800' },
    lost: { label: 'Lost', className: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

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
    demo_form: { label: 'Demo Form', className: 'bg-purple-50 text-purple-700' },
    referral: { label: 'Referral', className: 'bg-green-50 text-green-700' },
    social_media: { label: 'Social Media', className: 'bg-pink-50 text-pink-700' },
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
