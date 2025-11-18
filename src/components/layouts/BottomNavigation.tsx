'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Clock,
  FileText,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Beranda',
    href: '/employee',
    icon: Home,
  },
  {
    label: 'Absensi',
    href: '/employee/attendance',
    icon: Clock,
  },
  {
    label: 'Cuti',
    href: '/employee/leave',
    icon: CalendarDays,
  },
  {
    label: 'Dokumen',
    href: '/employee/documents',
    icon: FileText,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 relative transition-colors',
                isActive
                  ? 'text-talixa-indigo dark:text-talixa-indigo-200'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-talixa-indigo dark:bg-talixa-indigo-200 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
