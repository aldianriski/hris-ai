'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  Clock,
  FileText,
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  Target,
  Building2,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navSections = [
  {
    title: 'Utama',
    items: [
      { label: 'Dashboard', href: '/employer', icon: LayoutDashboard },
      { label: 'Karyawan', href: '/employer/employees', icon: Users },
    ],
  },
  {
    title: 'Kehadiran & Cuti',
    items: [
      { label: 'Absensi', href: '/employer/attendance', icon: Clock },
      { label: 'Cuti', href: '/employer/leave', icon: CalendarDays },
    ],
  },
  {
    title: 'Penggajian & Kinerja',
    items: [
      { label: 'Payroll', href: '/employer/payroll', icon: DollarSign },
      { label: 'Kinerja', href: '/employer/performance', icon: Target },
    ],
  },
  {
    title: 'Organisasi',
    items: [
      { label: 'Departemen', href: '/employer/departments', icon: Building2 },
      { label: 'Dokumen', href: '/employer/documents', icon: FileText },
    ],
  },
  {
    title: 'Kepatuhan',
    items: [
      { label: 'Compliance', href: '/employer/compliance', icon: Shield },
    ],
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onToggle?.(newState);
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg text-talixa-text-dark dark:text-white">
              Talixa HRIS
            </span>
          </motion.div>
        )}
        <button
          onClick={handleToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group',
                      isActive
                        ? 'bg-talixa-indigo-50 dark:bg-talixa-indigo-900/20 text-talixa-indigo dark:text-talixa-indigo-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebarIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-talixa-indigo dark:bg-talixa-indigo-200 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
                    {!collapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
            collapsed && 'justify-center'
          )}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Pengaturan</span>}
        </Link>
      </div>
    </aside>
  );
}
