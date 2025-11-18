/**
 * Company Settings Component
 * Form for company information settings
 */

'use client';

import { Building2, Mail, Phone, MapPin, Save } from 'lucide-react';
import { SettingsSection } from './SettingsSection';

interface CompanyData {
  name: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  taxId: string;
  registrationNumber: string;
}

interface CompanySettingsProps {
  data?: CompanyData;
  onSave?: (data: CompanyData) => void;
}

export function CompanySettings({ data, onSave }: CompanySettingsProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries()) as unknown as CompanyData;
    onSave?.(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SettingsSection
        title="Company Information"
        description="Basic information about your company"
        icon={Building2}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Company Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={data?.name}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry *
            </label>
            <select
              name="industry"
              id="industry"
              defaultValue={data?.industry}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select industry</option>
              <option value="technology">Technology</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Services</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={data?.email}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              defaultValue={data?.phone}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
              Tax ID (NPWP)
            </label>
            <input
              type="text"
              name="taxId"
              id="taxId"
              defaultValue={data?.taxId}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
              Registration Number (NIB)
            </label>
            <input
              type="text"
              name="registrationNumber"
              id="registrationNumber"
              defaultValue={data?.registrationNumber}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Company Address"
        description="Physical location of your company"
        icon={MapPin}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Street Address *
            </label>
            <textarea
              name="address"
              id="address"
              rows={3}
              defaultValue={data?.address}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <input
              type="text"
              name="city"
              id="city"
              defaultValue={data?.city}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700">
              Province *
            </label>
            <input
              type="text"
              name="province"
              id="province"
              defaultValue={data?.province}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              defaultValue={data?.postalCode}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </SettingsSection>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </form>
  );
}
