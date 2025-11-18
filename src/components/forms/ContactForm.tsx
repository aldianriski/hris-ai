'use client';

import React, { useState } from 'react';
import { Button } from '@/components/marketing/Button';
import { trackContactForm } from '@/lib/analytics/events';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Submit to API (using leads endpoint with contact source)
      const response = await fetch('/api/v1/cms/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          company: formData.company,
          source: 'contact_form',
          metadata: {
            subject: formData.subject,
            message: formData.message,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Terjadi kesalahan');
      }

      // Track analytics
      await trackContactForm(formData.email, formData.subject);

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
      });
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pesan Terkirim!</h3>
        <p className="text-gray-600 mb-6">
          Terima kasih telah menghubungi kami. Tim kami akan merespons dalam 1x24 jam.
        </p>
        <Button variant="outline" onClick={() => setSuccess(false)}>
          Kirim Pesan Lain
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
          Nama <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          placeholder="anda@email.com"
        />
      </div>

      {/* Company */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Perusahaan
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
          placeholder="Nama Perusahaan (Opsional)"
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subjek <span className="text-red-500">*</span>
        </label>
        <select
          id="subject"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
        >
          <option value="">Pilih subjek...</option>
          <option value="sales">Pertanyaan Sales</option>
          <option value="support">Dukungan Teknis</option>
          <option value="partnership">Kemitraan</option>
          <option value="feedback">Feedback Produk</option>
          <option value="other">Lainnya</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Pesan <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent resize-none"
          placeholder="Tuliskan pesan Anda..."
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Kirim Pesan
      </Button>

      <p className="text-xs text-center text-gray-500">
        Kami biasanya merespons dalam 1x24 jam pada hari kerja
      </p>
    </form>
  );
}
