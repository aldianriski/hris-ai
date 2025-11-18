'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Building2,
  TrendingUp,
  Users
} from 'lucide-react';

export default function CaseStudiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  // Mock data - replace with actual API call
  const caseStudies = [
    {
      id: '1',
      title: 'PT Maju Bersama: Efisiensi Payroll 80% dengan Talixa',
      slug: 'pt-maju-bersama-efisiensi-payroll',
      company_name: 'PT Maju Bersama',
      industry: 'Technology',
      status: 'published',
      employee_count: 150,
      results: {
        time_saved: '80%',
        cost_reduction: '60%',
        satisfaction: '95%',
      },
      published_at: '2025-11-10',
      views: 847,
    },
    {
      id: '2',
      title: 'Retail Besar: Manajemen 500+ Karyawan Multi-Lokasi',
      slug: 'retail-besar-manajemen-multi-lokasi',
      company_name: 'PT Retail Besar',
      industry: 'Retail',
      status: 'published',
      employee_count: 500,
      results: {
        time_saved: '70%',
        accuracy: '99.9%',
        satisfaction: '92%',
      },
      published_at: '2025-11-05',
      views: 1234,
    },
    {
      id: '3',
      title: 'Manufacturing Solutions: Transformasi Digital HR',
      slug: 'manufacturing-solutions-transformasi-digital',
      company_name: 'PT Manufacturing Solutions',
      industry: 'Manufacturing',
      status: 'draft',
      employee_count: 300,
      results: {
        time_saved: '75%',
        cost_reduction: '55%',
      },
      published_at: null,
      views: 0,
    },
  ];

  const filteredCaseStudies = caseStudies.filter((study) => {
    const matchesSearch =
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || study.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || study.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Studies</h1>
          <p className="text-gray-600 mt-2">Customer success stories and testimonials</p>
        </div>
        <Link href="/admin/cms/case-studies/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Case Study
          </Button>
        </Link>
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
                placeholder="Search case studies..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Industry Filter */}
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
            >
              <option value="all">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Services">Services</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Case Studies" value="10" color="blue" />
        <StatCard label="Published" value="8" color="green" />
        <StatCard label="Drafts" value="2" color="gray" />
        <StatCard label="Total Views" value="8.5K" color="purple" />
      </div>

      {/* Case Studies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCaseStudies.map((study) => (
          <Card key={study.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-talixa-blue" />
                    <span className="text-sm font-medium text-talixa-blue">
                      {study.industry}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{study.title}</h3>
                  <StatusBadge status={study.status} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  {study.company_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {study.employee_count} employees
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="h-4 w-4" />
                  {study.views} views
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Results */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Results</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(study.results).map(([key, value]) => (
                    <div key={key} className="bg-talixa-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-talixa-blue" />
                        <span className="text-xs text-gray-600 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-talixa-blue">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>
                  {study.published_at
                    ? `Published: ${new Date(study.published_at).toLocaleDateString('id-ID')}`
                    : 'Draft'}
                </span>
                <span>/{study.slug}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-talixa-blue rounded-lg hover:bg-talixa-blue-700">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCaseStudies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No case studies found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or create a new case study
            </p>
            <Link href="/admin/cms/case-studies/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Case Study
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
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
    green: 'text-talixa-green',
    gray: 'text-gray-600',
    purple: 'text-talixa-purple',
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
    published: { label: 'Published', className: 'bg-green-100 text-green-800' },
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
