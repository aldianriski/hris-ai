import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure platform-wide settings and integrations
        </p>
      </div>

      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Coming Soon
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Platform configuration features will be available in Sprint 15.
          </p>
        </div>
      </div>
    </div>
  );
}
