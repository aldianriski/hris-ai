'use client';

import React, { useState, useMemo } from 'react';
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
  Users,
  Loader2
} from 'lucide-react';
import { useCaseStudies, useDeleteCaseStudy } from '@/lib/hooks/useCms';
import type { CaseStudyStatus } from '@/lib/db/cms-schema';

export default function CaseStudiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStudyStatus | 'all'>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  // Fetch case studies from API
  const { data, isLoading, error } = useCaseStudies({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    industry: industryFilter !== 'all' ? industryFilter : undefined,
    search: searchQuery || undefined,
  });

  const deleteCaseStudy = useDeleteCaseStudy();

  // Calculate stats
  const stats = useMemo(() => {
    if (!data?.data) return { total: 0, published: 0, draft: 0, views: 0 };

    const studies = data.data;
    return {
      total: studies.length,
      published: studies.filter((s) => s.status === 'published').length,
      draft: studies.filter((s) => s.status === 'draft').length,
      views: studies.reduce((sum, s) => sum + s.view_count, 0),
    };
  }, [data]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return;

    try {
      await deleteCaseStudy.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete case study:', error);
      alert('Failed to delete case study');
    }
  };

  const caseStudies = data?.data || [];
  const filteredCaseStudies = caseStudies;

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
        <StatCard label="Total Case Studies" value={stats.total.toString()} color="blue" />
        <StatCard label="Published" value={stats.published.toString()} color="green" />
        <StatCard label="Drafts" value={stats.draft.toString()} color="gray" />
        <StatCard label="Total Views" value={stats.views > 1000 ? `${(stats.views / 1000).toFixed(1)}K` : stats.views.toString()} color="purple" />
      </div>

      {/* Case Studies Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-talixa-blue" />
          <span className="ml-2 text-gray-600">Loading case studies...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          Failed to load case studies. Please try again.
        </div>
      ) : filteredCaseStudies.length === 0 ? (
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
      ) : (
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
                  {study.view_count} views
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
                <Link href={`/case-studies/${study.slug}`} target="_blank" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                </Link>
                <Link href={`/admin/cms/case-studies/${study.id}`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-talixa-blue rounded-lg hover:bg-talixa-blue-700">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(study.id)}
                  disabled={deleteCaseStudy.isPending}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  {deleteCaseStudy.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
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
