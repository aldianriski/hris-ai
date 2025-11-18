import React from 'react';
import {
  Button,
  ButtonGroup,
  Section,
  Container,
  Card,
  CardTitle,
  CardDescription,
} from '@/components/marketing';
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  Star,
  BarChart3,
  Brain,
  FileText,
  Globe,
} from 'lucide-react';

/**
 * Talixa HRIS Homepage
 *
 * Marketing homepage following the Branding PRD specifications.
 *
 * @see docs/BRANDING_PRD.md
 */
export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-talixa-gray-900 mb-6">
            HRIS Pintar untuk Bisnis Indonesia 🇮🇩
          </h1>
          <p className="text-xl sm:text-2xl text-talixa-gray-600 mb-8">
            Kelola karyawan dengan mudah menggunakan AI. Hemat waktu, tingkatkan
            produktivitas, comply dengan UU Ketenagakerjaan.
          </p>

          <ButtonGroup className="justify-center">
            <Button variant="primary" size="lg" href="/pricing">
              Mulai Gratis 14 Hari
            </Button>
            <Button variant="outline" size="lg" href="/resources/demo">
              Lihat Demo
            </Button>
          </ButtonGroup>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-talixa-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-talixa-green" />
              <span>Setup 5 menit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-talixa-green" />
              <span>Gratis 14 hari</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-talixa-green" />
              <span>Tanpa kartu kredit</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Social Proof */}
      <Section spacing="sm" background="white">
        <div className="text-center">
          <p className="text-talixa-gray-600 mb-6">
            Dipercaya oleh 1,000+ Perusahaan di Indonesia
          </p>
          <div className="flex justify-center items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-6 w-6 fill-talixa-gold text-talixa-gold" />
            ))}
          </div>
          <p className="text-lg font-semibold text-talixa-gray-900">
            4.8/5 dari 500+ review
          </p>
        </div>
      </Section>

      {/* Features Showcase */}
      <Section spacing="lg" background="gray">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Semua yang Anda Butuhkan untuk HR
          </h2>
          <p className="text-xl text-talixa-gray-600 max-w-2xl mx-auto">
            Platform lengkap untuk mengelola seluruh lifecycle karyawan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Users className="h-8 w-8 text-talixa-blue" />}
            title="Manajemen Karyawan"
            description="Database karyawan lengkap, org chart interaktif, onboarding otomatis"
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8 text-talixa-green" />}
            title="Absensi & Cuti"
            description="Clock in/out mobile, GPS tracking, approval workflow, leave balance"
          />
          <FeatureCard
            icon={<DollarSign className="h-8 w-8 text-talixa-purple" />}
            title="Payroll Akurat"
            description="Auto-calculate gaji & pajak, BPJS integration, payslip generation"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-talixa-gold" />}
            title="Performance Review"
            description="Goal tracking, 360° feedback, review cycles, analytics lengkap"
          />
        </div>

        <div className="mt-12 text-center">
          <Button variant="primary" href="/features" size="lg">
            Lihat Semua Fitur
          </Button>
        </div>
      </Section>

      {/* AI Features */}
      <Section spacing="lg" background="white">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-6">
              AI yang Bekerja untuk Anda
            </h2>
            <p className="text-lg text-talixa-gray-600 mb-8">
              Teknologi AI terdepan untuk mengotomasi tugas HR repetitif dan
              memberikan insights yang actionable.
            </p>

            <div className="space-y-6">
              <AIFeature
                icon={<Brain />}
                title="Auto-Approve Cuti"
                description="AI otomatis approve cuti sederhana berdasarkan policy perusahaan"
              />
              <AIFeature
                icon={<BarChart3 />}
                title="Anomaly Detection"
                description="Deteksi anomali absensi dan payroll secara real-time"
              />
              <AIFeature
                icon={<FileText />}
                title="Document Extraction"
                description="Extract data dari dokumen KTP, KK, ijazah otomatis"
              />
              <AIFeature
                icon={<TrendingUp />}
                title="Predictive Analytics"
                description="Prediksi attrition risk dan kebutuhan hiring"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-talixa-purple-50 to-talixa-blue-50 rounded-2xl p-12 flex items-center justify-center">
            <Brain className="h-64 w-64 text-talixa-purple opacity-20" />
          </div>
        </div>
      </Section>

      {/* Pricing Preview */}
      <Section spacing="lg" background="gradient">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Harga Transparan, Tanpa Biaya Tersembunyi
          </h2>
          <p className="text-xl text-talixa-gray-600">
            Pilih paket yang sesuai dengan ukuran bisnis Anda
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            name="Starter"
            price="25,000"
            period="per karyawan/bulan"
            features={[
              'Core HR',
              'Attendance',
              'Leave Management',
              'Basic Reports',
            ]}
            cta="Mulai Gratis"
            href="/pricing"
          />
          <PricingCard
            name="Pro"
            price="50,000"
            period="per karyawan/bulan"
            features={[
              'Everything in Starter',
              'Payroll',
              'Performance Reviews',
              'AI Features',
            ]}
            cta="Mulai Gratis"
            href="/pricing"
            highlighted
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            period="hubungi sales"
            features={[
              'Everything in Pro',
              'Dedicated Support',
              'Custom Integration',
              'SLA Guarantee',
            ]}
            cta="Hubungi Sales"
            href="/contact"
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-talixa-gray-600">
            Semua paket: 14 hari gratis, batalkan kapan saja
          </p>
        </div>
      </Section>

      {/* Testimonials */}
      <Section spacing="lg" background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Apa Kata Pelanggan Kami
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <TestimonialCard
            quote="Talixa menghemat 15 jam per minggu untuk tim HR kami. Sekarang kami bisa fokus ke talent development."
            author="Sarah Wijaya"
            role="HR Manager"
            company="TechStartup"
            rating={5}
          />
          <TestimonialCard
            quote="Setup cuma 2 jam, onboarding karyawan jadi super cepat. ROI dalam 3 bulan!"
            author="Budi Santoso"
            role="CEO"
            company="RetailCo"
            rating={5}
          />
        </div>
      </Section>

      {/* Trust & Security */}
      <Section spacing="lg" background="gray">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Keamanan & Compliance yang Anda Butuhkan
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <TrustBadge icon={<Shield />} text="ISO 27001 Certified" />
          <TrustBadge icon={<Shield />} text="SOC 2 Type II" />
          <TrustBadge icon={<Globe />} text="GDPR Compliant" />
          <TrustBadge icon={<Shield />} text="UU Ketenagakerjaan" />
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
          <div>
            <CheckCircle className="h-8 w-8 text-talixa-green mx-auto mb-3" />
            <p className="font-semibold text-talixa-gray-900">
              99.9% Uptime SLA
            </p>
          </div>
          <div>
            <CheckCircle className="h-8 w-8 text-talixa-green mx-auto mb-3" />
            <p className="font-semibold text-talixa-gray-900">Daily Backups</p>
          </div>
          <div>
            <CheckCircle className="h-8 w-8 text-talixa-green mx-auto mb-3" />
            <p className="font-semibold text-talixa-gray-900">
              End-to-end Encryption
            </p>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-talixa-gray-900 mb-6">
            Siap Transform HR Anda?
          </h2>
          <p className="text-xl text-talixa-gray-600 mb-8">
            Bergabung dengan 1,000+ perusahaan yang sudah menggunakan Talixa
          </p>

          <Button variant="primary" size="xl" href="/pricing">
            Mulai Gratis 14 Hari
          </Button>

          <p className="mt-6 text-talixa-gray-600">
            Atau{' '}
            <a
              href="/resources/demo"
              className="text-talixa-blue hover:underline font-semibold"
            >
              Jadwalkan Demo dengan Tim Kami
            </a>
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-talixa-gray-600">
            <span>✓ Tidak perlu kartu kredit</span>
            <span>✓ Setup 5 menit</span>
            <span>✓ Support 24/7</span>
          </div>
        </div>
      </Section>
    </>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card variant="elevated" padding="lg" hoverable>
      <div className="mb-4">{icon}</div>
      <CardTitle className="text-xl mb-3">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </Card>
  );
}

// AI Feature Component
function AIFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-talixa-purple-50 flex items-center justify-center text-talixa-purple">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-6 w-6',
        })}
      </div>
      <div>
        <h3 className="font-semibold text-talixa-gray-900 mb-2">{title}</h3>
        <p className="text-talixa-gray-600">{description}</p>
      </div>
    </div>
  );
}

// Pricing Card Component
function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  href,
  highlighted = false,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}) {
  return (
    <Card
      variant={highlighted ? 'bordered' : 'elevated'}
      padding="lg"
      className={highlighted ? 'transform scale-105' : ''}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-talixa-blue text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-talixa-gray-900 mb-2">{name}</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold text-talixa-gray-900">
            {price === 'Custom' ? '' : 'Rp '}
            {price}
          </span>
          {price !== 'Custom' && (
            <span className="text-talixa-gray-600">/bulan</span>
          )}
        </div>
        <p className="text-sm text-talixa-gray-600">{period}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-talixa-green flex-shrink-0 mt-0.5" />
            <span className="text-talixa-gray-700">{feature}</span>
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

// Testimonial Card Component
function TestimonialCard({
  quote,
  author,
  role,
  company,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}) {
  return (
    <Card variant="elevated" padding="lg">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-talixa-gold text-talixa-gold" />
        ))}
      </div>
      <p className="text-lg text-talixa-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-semibold text-talixa-gray-900">{author}</p>
        <p className="text-sm text-talixa-gray-600">
          {role} at {company}
        </p>
      </div>
    </Card>
  );
}

// Trust Badge Component
function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-sm">
      <div className="text-talixa-blue">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-10 w-10',
        })}
      </div>
      <p className="text-sm font-semibold text-talixa-gray-900 text-center">
        {text}
      </p>
    </div>
  );
}
