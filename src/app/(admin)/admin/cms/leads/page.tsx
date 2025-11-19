'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  Building2,
  Calendar,
  Tag,
  Loader2,
  Trash2
} from 'lucide-react';
import { useLeads, useDeleteLead } from '@/lib/hooks/useCms';
import type { LeadStatus } from '@/lib/db/cms-schema';

export default function LeadsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Fetch leads from API
  const { data, isLoading, error } = useLeads({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    source: sourceFilter !== 'all' ? sourceFilter : undefined,
    search: searchQuery || undefined,
  });

  const deleteLead = useDeleteLead();

  // Calculate stats
  const stats = useMemo(() => {
    if (!data?.data) return { total: 0, new: 0, qualified: 0, converted: 0 };

    const leadsData = data.data;
    return {
      total: leadsData.length,
      new: leadsData.filter((l) => l.status === 'new').length,
      qualified: leadsData.filter((l) => l.status === 'qualified').length,
      converted: leadsData.filter((l) => l.status === 'converted').length,
    };
  }, [data]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await deleteLead.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead');
    }
  };

  const leads = data?.data || [];
  const filteredLeads = leads;

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
        <StatCard label="Total Leads" value={stats.total.toString()} color="blue" />
        <StatCard label="New" value={stats.new.toString()} color="purple" />
        <StatCard label="Qualified" value={stats.qualified.toString()} color="green" />
        <StatCard label="Converted" value={stats.converted.toString()} color="gold" />
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-talixa-blue" />
              <span className="ml-2 text-gray-600">Loading leads...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Failed to load leads. Please try again.
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leads found.
            </div>
          ) : (
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
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deleteLead.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          {deleteLead.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
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
