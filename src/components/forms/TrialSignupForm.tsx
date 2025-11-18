'use client';

import React, { useState } from 'react';
import { Button } from '@/components/marketing/Button';
import { trackTrialSignup } from '@/lib/analytics/events';

export function TrialSignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    company_name: '',
    phone: '',
    employee_count: '10',
    terms_accepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate terms acceptance
      if (!formData.terms_accepted) {
        setError('Anda harus menyetujui syarat dan ketentuan');
        setLoading(false);
        return;
      }

      // Submit to API
      const response = await fetch('/api/v1/cms/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          company: formData.company_name,
          phone: formData.phone,
          source: 'trial_signup',
          interest: `Trial - ${formData.employee_count} employees`,
          metadata: {
            employee_count: parseInt(formData.employee_count),
            form_type: 'trial_signup',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Terjadi kesalahan');
      }

      // Track analytics
      await trackTrialSignup(
        formData.email,
        formData.company_name,
        `${formData.employee_count} employees`
      );

      setSuccess(true);

      // Redirect to onboarding or thank you page after 2 seconds
      setTimeout(() => {
        window.location.href = '/hr/onboarding?source=trial';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-talixa-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h3>
        <p className="text-gray-600">
          Kami akan menghubungi Anda segera untuk memulai trial 14 hari gratis.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Kantor <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
          placeholder="anda@perusahaan.com"
        />
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Perusahaan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="company"
          required
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
          placeholder="PT Nama Perusahaan"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Nomor Telepon <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
          placeholder="+62 812-3456-7890"
        />
      </div>

      {/* Employee Count */}
      <div>
        <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-1">
          Jumlah Karyawan <span className="text-red-500">*</span>
        </label>
        <select
          id="employees"
          value={formData.employee_count}
          onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
        >
          <option value="1-10">1-10 karyawan</option>
          <option value="11-50">11-50 karyawan</option>
          <option value="51-100">51-100 karyawan</option>
          <option value="101-200">101-200 karyawan</option>
          <option value="201-500">201-500 karyawan</option>
          <option value="500+">500+ karyawan</option>
        </select>
      </div>

      {/* Terms Acceptance */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="terms"
          checked={formData.terms_accepted}
          onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
          className="mt-1 h-4 w-4 text-talixa-blue border-gray-300 rounded focus:ring-talixa-blue"
        />
        <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
          Saya setuju dengan{' '}
          <a href="/legal/terms" className="text-talixa-blue hover:underline" target="_blank">
            Syarat & Ketentuan
          </a>{' '}
          dan{' '}
          <a href="/legal/privacy" className="text-talixa-blue hover:underline" target="_blank">
            Kebijakan Privasi
          </a>
        </label>
      </div>

      {/* Submit Button */}
      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Mulai Gratis 14 Hari
      </Button>

      <p className="text-xs text-center text-gray-500">
        Tidak perlu kartu kredit • Setup dalam 5 menit • Cancel kapan saja
      </p>
    </form>
  );
}
