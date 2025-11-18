/**
 * Settings Section Component
 * Reusable section for settings pages
 */

'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
}

export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: SettingsSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="rounded-lg bg-blue-50 p-2">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
