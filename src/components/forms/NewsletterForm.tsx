'use client';

import React, { useState } from 'react';
import { Button } from '@/components/marketing/Button';
import { trackNewsletterSignup } from '@/lib/analytics/events';

interface NewsletterFormProps {
  source?: string;
  inline?: boolean;
}

export function NewsletterForm({ source = 'website', inline = false }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Submit to API
      const response = await fetch('/api/v1/cms/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Terjadi kesalahan');
      }

      // Track analytics
      await trackNewsletterSignup(email, source);

      setSuccess(true);
      setEmail('');

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (inline) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Anda"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
        />
        <Button type="submit" variant="primary" loading={loading}>
          Subscribe
        </Button>
        {(success || error) && (
          <div className="w-full mt-2">
            {success && (
              <p className="text-sm text-talixa-green">Terima kasih telah berlangganan!</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-talixa-green-50 border border-talixa-green-200 text-talixa-green-800 px-4 py-3 rounded-lg">
          Terima kasih! Anda telah berhasil berlangganan newsletter kami.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talixa-blue focus:border-transparent"
          placeholder="anda@email.com"
        />
      </div>

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Subscribe
      </Button>

      <p className="text-xs text-center text-gray-500">
        Dapatkan tips HR, update produk, dan penawaran eksklusif. Unsubscribe kapan saja.
      </p>
    </form>
  );
}
