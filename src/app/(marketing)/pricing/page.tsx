'use client';

import React, { useState } from 'react';
import {
  Button,
  Section,
  Container,
  Card,
  CardTitle,
  CardDescription,
} from '@/components/marketing';
import { CheckCircle, X, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const [employeeCount, setEmployeeCount] = useState(10);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const starterPrice = 25000;
  const proPrice = 50000;

  const calculatePrice = (basePrice: number) => {
    const monthlyTotal = basePrice * employeeCount;
    const annualTotal = monthlyTotal * 12 * 0.8; // 20% discount for annual
    return billingCycle === 'monthly' ? monthlyTotal : annualTotal / 12;
  };

  return (
    <>
      {/* Hero */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-talixa-gray-900 mb-6">
            Harga Transparan untuk Bisnis Anda
          </h1>
          <p className="text-xl text-talixa-gray-600 mb-8">
            Pilih paket yang sesuai. Gratis 14 hari, tanpa kartu kredit.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-lg p-2 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-talixa-blue text-white'
                  : 'text-talixa-gray-700 hover:bg-talixa-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                billingCycle === 'annual'
                  ? 'bg-talixa-blue text-white'
                  : 'text-talixa-gray-700 hover:bg-talixa-gray-100'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-talixa-green text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </Section>

      {/* Price Calculator */}
      <Section spacing="lg" background="white">
        <div className="max-w-2xl mx-auto">
          <Card variant="elevated" padding="lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-talixa-gray-900 mb-2">
                Kalkulator Harga
              </h2>
              <p className="text-talixa-gray-600">
                Hitung estimasi biaya untuk perusahaan Anda
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-talixa-gray-900 mb-3">
                Jumlah Karyawan: {employeeCount}
              </label>
              <input
                type="range"
                min="1"
                max="500"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(Number(e.target.value))}
                className="w-full h-2 bg-talixa-gray-200 rounded-lg appearance-none cursor-pointer accent-talixa-blue"
              />
              <div className="flex justify-between text-xs text-talixa-gray-600 mt-2">
                <span>1</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
                <span>500</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-talixa-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-talixa-gray-900 mb-2">
                  Starter
                </h3>
                <div className="text-3xl font-bold text-talixa-blue mb-1">
                  Rp {calculatePrice(starterPrice).toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-talixa-gray-600">per bulan</div>
                {billingCycle === 'annual' && (
                  <div className="text-xs text-talixa-green mt-2">
                    Hemat Rp{' '}
                    {(
                      starterPrice *
                      employeeCount *
                      12 *
                      0.2
                    ).toLocaleString('id-ID')}{' '}
                    per tahun
                  </div>
                )}
              </div>

              <div className="bg-talixa-green-50 rounded-lg p-6 border-2 border-talixa-green">
                <h3 className="font-semibold text-talixa-gray-900 mb-2">
                  Pro
                </h3>
                <div className="text-3xl font-bold text-talixa-green mb-1">
                  Rp {calculatePrice(proPrice).toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-talixa-gray-600">per bulan</div>
                {billingCycle === 'annual' && (
                  <div className="text-xs text-talixa-green mt-2">
                    Hemat Rp{' '}
                    {(proPrice * employeeCount * 12 * 0.2).toLocaleString(
                      'id-ID'
                    )}{' '}
                    per tahun
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Pricing Plans */}
      <Section spacing="lg" background="gray">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter */}
          <PricingCard
            name="Starter"
            price={calculatePrice(starterPrice)}
            description="Untuk perusahaan yang baru mulai"
            features={[
              'Employee database',
              'Attendance & clock in/out',
              'Leave management',
              'Basic reports',
              'Email support',
              'Mobile access',
            ]}
            notIncluded={[
              'Payroll',
              'Performance reviews',
              'AI features',
              'Advanced analytics',
            ]}
            cta="Mulai Gratis"
            href="/signup?plan=starter"
          />

          {/* Pro - Highlighted */}
          <PricingCard
            name="Pro"
            price={calculatePrice(proPrice)}
            description="Untuk perusahaan yang berkembang"
            features={[
              'Everything in Starter',
              'Payroll & benefits',
              'BPJS integration',
              'Performance management',
              'AI features',
              'Advanced analytics',
              'API access',
              'Priority support',
            ]}
            cta="Mulai Gratis"
            href="/signup?plan=pro"
            highlighted
            popular
          />

          {/* Enterprise */}
          <PricingCard
            name="Enterprise"
            price={null}
            description="Untuk perusahaan besar"
            features={[
              'Everything in Pro',
              'Dedicated account manager',
              'Custom integration',
              'SLA guarantee (99.9%)',
              'On-premise deployment option',
              'Custom training',
              'Unlimited users',
              '24/7 phone support',
            ]}
            cta="Hubungi Sales"
            href="/contact"
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-talixa-gray-600">
            🎉 Semua paket termasuk: 14 hari trial gratis, no credit card required,
            cancel anytime
          </p>
        </div>
      </Section>

      {/* Feature Comparison Table */}
      <Section spacing="lg" background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-talixa-gray-900 mb-4">
            Perbandingan Fitur Lengkap
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-talixa-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-talixa-gray-900">
                  Feature
                </th>
                <th className="text-center py-4 px-6 font-semibold text-talixa-gray-900">
                  Starter
                </th>
                <th className="text-center py-4 px-6 font-semibold text-talixa-blue bg-talixa-blue-50">
                  Pro
                </th>
                <th className="text-center py-4 px-6 font-semibold text-talixa-gray-900">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              <FeatureRow
                feature="Employee Database"
                starter={true}
                pro={true}
                enterprise={true}
              />
              <FeatureRow
                feature="Attendance & Time Tracking"
                starter={true}
                pro={true}
                enterprise={true}
              />
              <FeatureRow
                feature="Leave Management"
                starter={true}
                pro={true}
                enterprise={true}
              />
              <FeatureRow
                feature="Payroll & Benefits"
                starter={false}
                pro={true}
                enterprise={true}
              />
              <FeatureRow
                feature="Performance Management"
                starter={false}
                pro={true}
                enterprise={true}
              />
              <FeatureRow
                feature="AI Features"
                starter={false}
                pro={true}
                enterprise={true}
              />
              <FeatureRow
                feature="Advanced Analytics"
                starter={false}
                pro={true}
                enterprise={true}
              />
              <FeatureRow
                feature="API Access"
                starter={false}
                pro={true}
                enterprise={true}
              />
              <FeatureRow
                feature="Custom Integration"
                starter={false}
                pro={false}
                enterprise={true}
              />
              <FeatureRow
                feature="SLA Guarantee"
                starter={false}
                pro={false}
                enterprise={true}
              />
              <FeatureRow
                feature="Dedicated Support"
                starter={false}
                pro={false}
                enterprise={true}
              />
              <FeatureRow
                feature="On-premise Option"
                starter={false}
                pro={false}
                enterprise={true}
              />
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section spacing="lg" background="gray">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-talixa-gray-900 mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <FAQItem
            question="Apakah saya perlu kartu kredit untuk trial?"
            answer="Tidak. Anda bisa mulai trial 14 hari tanpa kartu kredit. Kami hanya akan meminta payment method setelah trial period berakhir."
          />
          <FAQItem
            question="Bagaimana cara upgrade atau downgrade paket?"
            answer="Anda bisa upgrade atau downgrade paket kapan saja dari dashboard. Perubahan akan efektif pada billing cycle berikutnya."
          />
          <FAQItem
            question="Apakah ada biaya setup atau implementasi?"
            answer="Tidak ada biaya setup. Semua paket sudah termasuk onboarding dan setup assistance dari tim kami."
          />
          <FAQItem
            question="Bagaimana jika jumlah karyawan saya berubah?"
            answer="Anda bisa menambah atau mengurangi jumlah user kapan saja. Billing akan disesuaikan secara pro-rata."
          />
          <FAQItem
            question="Apakah data saya aman?"
            answer="Ya. Kami menggunakan enkripsi end-to-end, backup harian, dan compliance dengan ISO 27001 & SOC 2."
          />
        </div>
      </Section>

      {/* CTA */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-talixa-gray-900 mb-6">
            Mulai Gratis Hari Ini
          </h2>
          <p className="text-xl text-talixa-gray-600 mb-8">
            Setup dalam 5 menit. Tidak perlu kartu kredit.
          </p>
          <Button variant="primary" size="xl" href="/signup">
            Coba Gratis 14 Hari
          </Button>
        </div>
      </Section>
    </>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  notIncluded = [],
  cta,
  href,
  highlighted = false,
  popular = false,
}: {
  name: string;
  price: number | null;
  description: string;
  features: string[];
  notIncluded?: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
  popular?: boolean;
}) {
  return (
    <Card
      variant={highlighted ? 'bordered' : 'elevated'}
      padding="lg"
      className={`relative ${highlighted ? 'transform scale-105' : ''}`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-talixa-blue text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-talixa-gray-900 mb-2">{name}</h3>
        <p className="text-sm text-talixa-gray-600 mb-4">{description}</p>

        {price !== null ? (
          <>
            <div className="text-4xl font-bold text-talixa-gray-900 mb-1">
              Rp {price.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-talixa-gray-600">per bulan</div>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-talixa-gray-900 mb-1">
              Custom
            </div>
            <div className="text-sm text-talixa-gray-600">hubungi sales</div>
          </>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-talixa-green flex-shrink-0 mt-0.5" />
            <span className="text-talixa-gray-700 text-sm">{feature}</span>
          </li>
        ))}
        {notIncluded.map((feature) => (
          <li key={feature} className="flex items-start gap-2 opacity-50">
            <X className="h-5 w-5 text-talixa-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-talixa-gray-500 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={highlighted ? 'primary' : 'outline'}
        href={href}
        fullWidth
      >
        {cta}
      </Button>
    </Card>
  );
}

function FeatureRow({
  feature,
  starter,
  pro,
  enterprise,
}: {
  feature: string;
  starter: boolean;
  pro: boolean;
  enterprise: boolean;
}) {
  return (
    <tr className="border-b border-talixa-gray-100">
      <td className="py-4 px-6 text-talixa-gray-700">{feature}</td>
      <td className="py-4 px-6 text-center">
        {starter ? (
          <CheckCircle className="h-5 w-5 text-talixa-green mx-auto" />
        ) : (
          <X className="h-5 w-5 text-talixa-gray-300 mx-auto" />
        )}
      </td>
      <td className="py-4 px-6 text-center bg-talixa-blue-50">
        {pro ? (
          <CheckCircle className="h-5 w-5 text-talixa-green mx-auto" />
        ) : (
          <X className="h-5 w-5 text-talixa-gray-300 mx-auto" />
        )}
      </td>
      <td className="py-4 px-6 text-center">
        {enterprise ? (
          <CheckCircle className="h-5 w-5 text-talixa-green mx-auto" />
        ) : (
          <X className="h-5 w-5 text-talixa-gray-300 mx-auto" />
        )}
      </td>
    </tr>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card variant="default" padding="md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div className="flex-1">
          <h3 className="font-semibold text-talixa-gray-900 mb-2">{question}</h3>
          {isOpen && <p className="text-talixa-gray-600 mt-2">{answer}</p>}
        </div>
        <HelpCircle className="h-5 w-5 text-talixa-blue flex-shrink-0" />
      </button>
    </Card>
  );
}
