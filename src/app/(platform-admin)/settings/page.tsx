import { PlatformSettings } from '@/components/platform/PlatformSettings';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure platform-wide settings and integrations
        </p>
      </div>

      <PlatformSettings />
    </div>
  );
}
