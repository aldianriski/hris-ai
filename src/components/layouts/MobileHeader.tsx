'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@heroui/react';
import { motion } from 'framer-motion';

interface MobileHeaderProps {
  title: string;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
  showSearch?: boolean;
  notificationCount?: number;
}

export function MobileHeader({
  title,
  onMenuClick,
  onNotificationClick,
  onSearchClick,
  showSearch = false,
  notificationCount = 0,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 lg:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Menu or Logo */}
        <div className="flex items-center gap-3">
          {onMenuClick ? (
            <Button
              isIconOnly
              variant="light"
              onPress={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
            </div>
          )}
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-bold text-talixa-text-dark dark:text-white"
          >
            {title}
          </motion.h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {showSearch && onSearchClick && (
            <Button
              isIconOnly
              variant="light"
              onPress={onSearchClick}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          {onNotificationClick && (
            <Button
              isIconOnly
              variant="light"
              onPress={onNotificationClick}
              aria-label="Notifications"
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
