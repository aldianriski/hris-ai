import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Briefcase,
  Users,
  Calendar,
  Mail,
  TrendingUp,
  Eye,
  MousePointerClick
} from 'lucide-react';

export const metadata = {
  title: 'CMS Dashboard | Talixa HRIS',
  description: 'Content management system dashboard',
};

export default function CMSDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your content and engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value="247"
          change="+12%"
          icon={<Users />}
          trend="up"
        />
        <StatCard
          title="Demo Requests"
          value="89"
          change="+8%"
          icon={<Calendar />}
          trend="up"
        />
        <StatCard
          title="Newsletter Subscribers"
          value="1,432"
          change="+23%"
          icon={<Mail />}
          trend="up"
        />
        <StatCard
          title="Page Views"
          value="12,847"
          change="+15%"
          icon={<Eye />}
          trend="up"
        />
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-talixa-blue" />
              Content Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ContentRow label="Published Blog Posts" value="24" total="32" />
              <ContentRow label="Published Case Studies" value="8" total="10" />
              <ContentRow label="Draft Content" value="10" total="42" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-talixa-green" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                title="New lead captured"
                description="PT Maju Bersama"
                time="2 hours ago"
              />
              <ActivityItem
                title="Demo request scheduled"
                description="PT Tech Startup"
                time="5 hours ago"
              />
              <ActivityItem
                title="Blog post published"
                description="5 Tips Mengelola HR di Era Digital"
                time="1 day ago"
              />
              <ActivityItem
                title="Newsletter sent"
                description="Monthly HR Updates - November"
                time="2 days ago"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              icon={<FileText />}
              label="Create Blog Post"
              href="/admin/cms/blog/new"
            />
            <QuickActionButton
              icon={<Briefcase />}
              label="Add Case Study"
              href="/admin/cms/case-studies/new"
            />
            <QuickActionButton
              icon={<Users />}
              label="View Leads"
              href="/admin/cms/leads"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last month
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-talixa-blue-50 flex items-center justify-center text-talixa-blue">
            {React.cloneElement(icon as React.ReactElement, {
              className: 'h-6 w-6',
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentRow({
  label,
  value,
  total,
}: {
  label: string;
  value: string;
  total: string;
}) {
  const percentage = (parseInt(value) / parseInt(total)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {value} / {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-talixa-blue h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-2 w-2 rounded-full bg-talixa-blue mt-2 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 truncate">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-talixa-blue hover:bg-talixa-blue-50 transition-colors group"
    >
      <div className="text-talixa-blue">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-5 w-5',
        })}
      </div>
      <span className="font-medium text-gray-900 group-hover:text-talixa-blue">
        {label}
      </span>
    </a>
  );
}
