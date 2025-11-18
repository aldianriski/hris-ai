import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  Calendar,
  Mail,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

export default function CMSAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/cms" className="text-xl font-bold text-talixa-blue">
              Talixa CMS
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            <NavLink href="/admin/cms" icon={<LayoutDashboard />} label="Dashboard" />
            <NavLink href="/admin/cms/blog" icon={<FileText />} label="Blog Posts" />
            <NavLink href="/admin/cms/case-studies" icon={<Briefcase />} label="Case Studies" />
            <NavLink href="/admin/cms/leads" icon={<Users />} label="Leads" />
            <NavLink href="/admin/cms/demo-requests" icon={<Calendar />} label="Demo Requests" />
            <NavLink href="/admin/cms/newsletter" icon={<Mail />} label="Newsletter" />
            <NavLink href="/admin/cms/analytics" icon={<BarChart3 />} label="Analytics" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-talixa-blue-50 hover:text-talixa-blue rounded-lg transition-colors group"
    >
      <span className="text-gray-500 group-hover:text-talixa-blue">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-5 w-5',
        })}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
