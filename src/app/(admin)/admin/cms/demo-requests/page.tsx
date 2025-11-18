'use client';

import React, { useState } from 'react';
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
  XCircle
} from 'lucide-react';

export default function DemoRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - replace with actual API call
  const demoRequests = [
    {
      id: '1',
      company_name: 'PT Maju Bersama',
      contact_name: 'Budi Santoso',
      email: 'budi@ptmaju.com',
      phone: '+62 812-3456-7890',
      employee_count: 50,
      status: 'scheduled',
      preferred_date: '2025-11-20',
      preferred_time: '14:00',
      notes: 'Interested in payroll and attendance features',
      created_at: '2025-11-18T10:30:00Z',
    },
    {
      id: '2',
      company_name: 'PT Tech Startup Indonesia',
      contact_name: 'Siti Rahayu',
      email: 'siti@techstartup.id',
      phone: '+62 821-9876-5432',
      employee_count: 25,
      status: 'completed',
      preferred_date: '2025-11-17',
      preferred_time: '10:00',
      notes: 'Looking for AI-powered HRIS solution',
      created_at: '2025-11-15T14:20:00Z',
    },
    {
      id: '3',
      company_name: 'PT Retail Besar',
      contact_name: 'Ahmad Wijaya',
      email: 'ahmad@retailbesar.co.id',
      phone: '+62 813-2468-1357',
      employee_count: 200,
      status: 'pending',
      preferred_date: '2025-11-22',
      notes: 'Multi-location management needed',
      created_at: '2025-11-18T09:15:00Z',
    },
    {
      id: '4',
      company_name: 'PT Manufacturing Solutions',
      contact_name: 'Lisa Permata',
      email: 'lisa@manufacturing.com',
      phone: '+62 815-7531-2468',
      employee_count: 150,
      status: 'cancelled',
      preferred_date: '2025-11-19',
      notes: 'Rescheduled to later date',
      created_at: '2025-11-16T16:45:00Z',
    },
  ];

  const filteredRequests = demoRequests.filter((request) => {
    const matchesSearch =
      request.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <StatCard label="Total Requests" value="89" color="blue" icon={<Calendar />} />
        <StatCard label="Pending" value="12" color="purple" icon={<Clock />} />
        <StatCard label="Scheduled" value="23" color="green" icon={<CheckCircle />} />
        <StatCard label="Completed" value="48" color="gold" icon={<CheckCircle />} />
      </div>

      {/* Demo Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Demo Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <button className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
