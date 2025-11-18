'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';

export default function BlogManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - replace with actual API call
  const blogPosts = [
    {
      id: '1',
      title: '5 Tips Mengelola HR di Era Digital',
      slug: '5-tips-mengelola-hr-di-era-digital',
      status: 'published',
      category: 'HR Tips',
      author: 'Admin',
      views: 1234,
      published_at: '2025-11-15',
      created_at: '2025-11-10',
    },
    {
      id: '2',
      title: 'Cara Efektif Menghitung Payroll dengan HRIS',
      slug: 'cara-efektif-menghitung-payroll-dengan-hris',
      status: 'published',
      category: 'Payroll',
      author: 'Admin',
      views: 892,
      published_at: '2025-11-12',
      created_at: '2025-11-08',
    },
    {
      id: '3',
      title: 'AI dalam HRIS: Masa Depan Manajemen SDM',
      slug: 'ai-dalam-hris-masa-depan-manajemen-sdm',
      status: 'draft',
      category: 'Technology',
      author: 'Admin',
      views: 0,
      published_at: null,
      created_at: '2025-11-16',
    },
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-2">Manage your blog content</p>
        </div>
        <Link href="/admin/cms/blog/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
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
                placeholder="Search posts..."
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
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Posts" value="32" color="blue" />
        <StatCard label="Published" value="24" color="green" />
        <StatCard label="Drafts" value="8" color="gray" />
        <StatCard label="Total Views" value="15.2K" color="purple" />
      </div>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Published
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-500 mt-1">/{post.slug}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-talixa-blue-100 text-talixa-blue">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">{post.views}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {post.published_at || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-600 hover:text-talixa-blue hover:bg-talixa-blue-50 rounded-lg">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-talixa-blue hover:bg-talixa-blue-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
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
    blue: 'bg-talixa-blue-50 text-talixa-blue',
    green: 'bg-talixa-green-50 text-talixa-green',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-talixa-purple-50 text-talixa-purple',
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
    scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
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
