'use client';

import { Bell, Search, Menu, Command } from 'lucide-react';
import { Button, Badge, Kbd } from '@heroui/react';
import { useState } from 'react';

export function PlatformHeader() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
      {/* Mobile Menu Button */}
      <Button
        isIconOnly
        variant="light"
        className="lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className={`
            absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
            ${searchFocused ? 'text-primary' : 'text-gray-400'}
          `} />
          <input
            type="text"
            placeholder="Search tenants, users, invoices..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`
              w-full pl-10 pr-20 py-2.5 text-sm
              border rounded-lg transition-all duration-200
              bg-gray-50 dark:bg-gray-900
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              hover:border-gray-300 dark:hover:border-gray-600
              ${searchFocused
                ? 'border-primary shadow-sm'
                : 'border-gray-200 dark:border-gray-700'
              }
            `}
          />
          {/* Keyboard Shortcut Hint */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <Kbd keys={['command']} className="hidden lg:inline-flex">K</Kbd>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Badge
          content="3"
          color="danger"
          size="sm"
          className="animate-pulse"
        >
          <Button
            isIconOnly
            variant="light"
            className="relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Button>
        </Badge>
      </div>
    </header>
  );
}
