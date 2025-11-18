'use client';

import React, { useState } from 'react';
import { Button } from '@/components/marketing/Button';
import { trackDemoRequest } from '@/lib/analytics/events';

export function DemoRequestForm() {
  const [formData, setFormData] = useState({
    contact_name: '',
    email: '',
    company_name: '',
    phone: '',
    employee_count: 50,
    preferred_date: '',
    preferred_time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Submit to API
      const response = await fetch('/api/v1/cms/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Terjadi kesalahan');
      }

      // Track analytics
      await trackDemoRequest(formData.email, formData.company_name);

      setSuccess(true);
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Permintaan Diterima!</h3>
        <p className="text-gray-600 mb-4">
          Tim kami akan menghubungi Anda segera untuk mengatur jadwal demo.
        </p>
        <Button variant="primary" href="/">
          Kembali ke Beranda
        </Button>
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

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.contact_name}
          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
          placeholder="Nama Anda"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
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
          Nomor Telepon
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
          placeholder="+62 812-3456-7890"
        />
      </div>

      {/* Employee Count */}
      <div>
        <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-1">
          Jumlah Karyawan
        </label>
        <input
          type="number"
          id="employees"
          min="1"
          max="10000"
          value={formData.employee_count}
          onChange={(e) =>
            setFormData({ ...formData, employee_count: parseInt(e.target.value) || 1 })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
        />
      </div>

      {/* Preferred Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Pilihan
          </label>
          <input
            type="date"
            id="date"
            value={formData.preferred_date}
            onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            Waktu Pilihan
          </label>
          <select
            id="time"
            value={formData.preferred_time}
            onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
          >
            <option value="">Pilih waktu</option>
            <option value="09:00">09:00 WIB</option>
            <option value="10:00">10:00 WIB</option>
            <option value="11:00">11:00 WIB</option>
            <option value="13:00">13:00 WIB</option>
            <option value="14:00">14:00 WIB</option>
            <option value="15:00">15:00 WIB</option>
            <option value="16:00">16:00 WIB</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Pesan / Pertanyaan
        </label>
        <textarea
          id="notes"
          rows={4}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent resize-none"
          placeholder="Beritahu kami fitur apa yang ingin Anda lihat..."
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Jadwalkan Demo
      </Button>

      <p className="text-xs text-center text-gray-500">
        Demo gratis 30 menit • Tidak ada komitmen • Q&A langsung
      </p>
    </form>
  );
}
