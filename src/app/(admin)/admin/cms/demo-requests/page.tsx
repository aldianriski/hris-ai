'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Search,
  Download,
  Mail,
  Phone,
  Building2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useDemoRequests, useDeleteDemoRequest } from '@/lib/hooks/useCms';
import type { DemoRequestStatus } from '@/lib/db/cms-schema';

export default function DemoRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DemoRequestStatus | 'all'>('all');

  // Fetch demo requests from API
  const { data, isLoading, error } = useDemoRequests({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  const deleteDemoRequest = useDeleteDemoRequest();

  // Calculate stats
  const stats = useMemo(() => {
    if (!data?.data) return { total: 0, pending: 0, scheduled: 0, completed: 0 };

    const requests = data.data;
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      scheduled: requests.filter((r) => r.status === 'scheduled').length,
      completed: requests.filter((r) => r.status === 'completed').length,
    };
  }, [data]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this demo request?')) return;

    try {
      await deleteDemoRequest.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete demo request:', error);
      alert('Failed to delete demo request');
    }
  };

  const demoRequests = data?.data || [];
  const filteredRequests = demoRequests;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demo Requests</h1>
          <p className="text-gray-600 mt-2">Manage and schedule product demos</p>
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
                placeholder="Search by company, name, or email..."
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
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={stats.total.toString()} color="blue" icon={<Calendar />} />
        <StatCard label="Pending" value={stats.pending.toString()} color="purple" icon={<Clock />} />
        <StatCard label="Scheduled" value={stats.scheduled.toString()} color="green" icon={<CheckCircle />} />
        <StatCard label="Completed" value={stats.completed.toString()} color="gold" icon={<CheckCircle />} />
      </div>

      {/* Demo Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Demo Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-talixa-blue" />
              <span className="ml-2 text-gray-600">Loading demo requests...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Failed to load demo requests. Please try again.
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No demo requests found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Company and Contact */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.company_name}
                        </h3>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="text-gray-600">{request.contact_name}</p>
                    </div>

                    {/* Contact Details */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {request.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {request.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {request.employee_count} employees
                      </div>
                    </div>

                    {/* Schedule Info */}
                    {request.preferred_date && (
                      <div className="flex items-center gap-2 text-sm font-medium text-talixa-blue">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.preferred_date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {request.preferred_time && ` at ${request.preferred_time}`}
                      </div>
                    )}

                    {/* Notes */}
                    {request.notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes: </span>
                          {request.notes}
                        </p>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="text-xs text-gray-500">
                      Requested on{' '}
                      {new Date(request.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button className="px-4 py-2 text-sm bg-talixa-blue text-white rounded-lg hover:bg-talixa-blue-700">
                      Schedule
                    </button>
                    <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Contact
                    </button>
                    <button
                      onClick={() => handleDelete(request.id)}
                      disabled={deleteDemoRequest.isPending}
                      className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleteDemoRequest.isPending ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  const colorClasses = {
    blue: 'bg-talixa-blue-50 text-talixa-blue',
    purple: 'bg-talixa-purple-50 text-talixa-purple',
    green: 'bg-talixa-green-50 text-talixa-green',
    gold: 'bg-talixa-gold-50 text-talixa-gold-800',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <p className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            {React.cloneElement(icon as React.ReactElement, {
              className: 'h-6 w-6',
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
