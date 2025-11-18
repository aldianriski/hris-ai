'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  LifeBuoy,
  BarChart3,
  Settings,
  Zap,
  LogOut,
  Flag,
  Receipt,
  Shield,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Mail,
  TestTube,
} from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/use-permissions';
import { getRoleDisplayName, type PlatformRole } from '@/lib/auth/permissions';
import { Skeleton, Button } from '@heroui/react';

// Define navigation items with groups for better organization
const navigationConfig = [
  {
    group: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['super_admin', 'platform_admin', 'support_admin', 'billing_admin'] as PlatformRole[]
      },
    ]
  },
  {
    group: 'Management',
    items: [
      {
        name: 'Tenants',
        href: '/tenants',
        icon: Building2,
        roles: ['super_admin', 'platform_admin', 'support_admin'] as PlatformRole[]
      },
      {
        name: 'Users',
        href: '/users',
        icon: Users,
        roles: ['super_admin', 'platform_admin'] as PlatformRole[]
      },
      {
        name: 'Roles',
        href: '/roles',
        icon: Shield,
        roles: ['super_admin', 'platform_admin'] as PlatformRole[]
      },
    ]
  },
  {
    group: 'Billing',
    items: [
      {
        name: 'Overview',
        href: '/billing',
        icon: CreditCard,
        roles: ['super_admin', 'billing_admin', 'platform_admin'] as PlatformRole[]
      },
      {
        name: 'Subscription Plans',
        href: '/subscription-plans',
        icon: CreditCard,
        roles: ['super_admin', 'billing_admin'] as PlatformRole[]
      },
      {
        name: 'Invoices',
        href: '/invoices',
        icon: Receipt,
        roles: ['super_admin', 'billing_admin', 'platform_admin'] as PlatformRole[]
      },
    ]
  },
  {
    group: 'Support',
    items: [
      {
        name: 'Live Chat',
        href: '/chat',
        icon: MessageCircle,
        roles: ['super_admin', 'platform_admin', 'support_admin'] as PlatformRole[],
        badge: 'New'
      },
      {
        name: 'Support Portal',
        href: '/support',
        icon: LifeBuoy,
        roles: ['super_admin', 'platform_admin', 'support_admin'] as PlatformRole[]
      },
    ]
  },
  {
    group: 'Analytics',
    items: [
      {
        name: 'Basic Analytics',
        href: '/analytics',
        icon: BarChart3,
        roles: ['super_admin', 'platform_admin'] as PlatformRole[]
      },
      {
        name: 'Advanced Analytics',
        href: '/analytics/advanced',
        icon: TrendingUp,
        roles: ['super_admin', 'platform_admin'] as PlatformRole[],
        badge: 'New'
      },
      {
        name: 'Compliance',
        href: '/compliance',
        icon: AlertTriangle,
        roles: ['super_admin', 'platform_admin'] as PlatformRole[],
        badge: 'New'
      },
    ]
  },
  {
    group: 'Configuration',
    items: [
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        roles: ['super_admin'] as PlatformRole[]
      },
      {
        name: 'Feature Flags',
        href: '/feature-flags',
        icon: Flag,
        roles: ['super_admin', 'platform_admin'] as PlatformRole[]
      },
      {
        name: 'Email Templates',
        href: '/settings/email-templates',
        icon: Mail,
        roles: ['super_admin', 'platform_admin'] as PlatformRole[],
        badge: 'New'
      },
      {
        name: 'Permission Testing',
        href: '/permissions/testing',
        icon: TestTube,
        roles: ['super_admin', 'platform_admin'] as PlatformRole[],
        badge: 'New'
      },
    ]
  },
];

export function PlatformSidebar() {
  const pathname = usePathname();
  const { user, loading } = useCurrentUser();

  // Filter navigation groups based on user role
  const filteredNavigation = user
    ? navigationConfig.map(group => ({
        ...group,
        items: group.items.filter(item => item.roles.includes(user.role as PlatformRole))
      })).filter(group => group.items.length > 0)
    : navigationConfig;

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 dark:text-white">HRIS Platform</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {loading ? (
          // Loading skeleton
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 flex-1 rounded" />
              </div>
            ))}
          </>
        ) : (
          filteredNavigation.map((group) => (
            <div key={group.group} className="space-y-1">
              {/* Group Label */}
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {group.group}
                </h3>
              </div>

              {/* Group Items */}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/') ||
                  (item.href !== '/dashboard' && pathname.includes(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {(item as any).badge && (
                      <span className={`
                        text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0
                        ${isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/10 text-primary dark:bg-primary/20'
                        }
                      `}>
                        {(item as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        {loading ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-2 w-32 rounded" />
            </div>
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">
                  {getUserInitials(user.email)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getRoleDisplayName(user.role)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="px-3">
              <Link href="/auth/logout" className="w-full">
                <Button
                  size="sm"
                  variant="flat"
                  className="w-full justify-start"
                  startContent={<LogOut className="w-4 h-4" />}
                >
                  Logout
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Not logged in</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
