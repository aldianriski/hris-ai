import React from 'react';
import {
  Button,
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
  FileText,
  Shield,
  Zap,
  BarChart3,
  Calendar,
  Award,
  MessageSquare,
  GitBranch,
  CheckCircle,
  Globe,
  Smartphone,
  Lock,
  Database,
} from 'lucide-react';

export const metadata = {
  title: 'Features | Talixa HRIS',
  description: 'Fitur lengkap HRIS untuk mengelola karyawan, absensi, payroll, performance, dan lebih banyak lagi.',
};

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-talixa-gray-900 mb-6">
            Semua Fitur yang Anda Butuhkan
          </h1>
          <p className="text-xl text-talixa-gray-600 mb-8">
            Platform HRIS lengkap untuk mengelola seluruh employee lifecycle
            dengan AI-powered automation
          </p>
          <Button variant="primary" size="lg" href="/pricing">
            Mulai Gratis 14 Hari
          </Button>
        </div>
      </Section>

      {/* Core Modules */}
      <Section spacing="lg" background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Modul Inti
          </h2>
          <p className="text-xl text-talixa-gray-600">
            Fungsi utama untuk HR management yang efisien
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FeatureModule
            icon={<Users className="h-12 w-12" />}
            title="Employee Management"
            description="Database karyawan lengkap dengan profil detail, documents, dan riwayat employment"
            features={[
              'Database karyawan terpusat',
              'Org chart interaktif',
              'Onboarding workflow otomatis',
              'Document management',
              'Employee self-service portal',
              'Custom fields & tags',
            ]}
          />

          <FeatureModule
            icon={<Clock className="h-12 w-12" />}
            title="Attendance & Time Tracking"
            description="Sistem absensi real-time dengan GPS tracking dan approval workflow"
            features={[
              'Clock in/out (web & mobile)',
              'GPS & geofencing',
              'Shift management',
              'Overtime tracking',
              'Leave management',
              'Approval workflow',
            ]}
          />

          <FeatureModule
            icon={<DollarSign className="h-12 w-12" />}
            title="Payroll & Benefits"
            description="Penggajian otomatis dengan perhitungan pajak dan BPJS terintegrasi"
            features={[
              'Auto-calculate gaji & deductions',
              'BPJS Kesehatan & Ketenagakerjaan',
              'PPh 21 calculation',
              'Payslip generation (PDF)',
              'Bank transfer integration',
              'Payroll reports',
            ]}
          />

          <FeatureModule
            icon={<TrendingUp className="h-12 w-12" />}
            title="Performance Management"
            description="Sistem performance review lengkap dengan goal tracking dan feedback"
            features={[
              'Goal & OKR tracking',
              '360° feedback',
              'Review cycles',
              'Performance ratings',
              'One-on-one meetings',
              'Analytics & reports',
            ]}
          />
        </div>
      </Section>

      {/* AI Features */}
      <Section spacing="lg" background="blue">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            AI-Powered Automation
          </h2>
          <p className="text-xl text-talixa-gray-600">
            Teknologi AI untuk mengotomasi tugas repetitif dan memberikan insights
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <AIFeatureCard
            icon={<Zap />}
            title="Auto-Approve Cuti"
            description="AI otomatis menyetujui permintaan cuti sederhana berdasarkan policy dan balance"
          />
          <AIFeatureCard
            icon={<BarChart3 />}
            title="Anomaly Detection"
            description="Deteksi anomali absensi dan payroll secara real-time untuk mencegah fraud"
          />
          <AIFeatureCard
            icon={<FileText />}
            title="Document OCR"
            description="Extract data dari KTP, KK, ijazah, dan dokumen lainnya secara otomatis"
          />
          <AIFeatureCard
            icon={<TrendingUp />}
            title="Predictive Analytics"
            description="Prediksi attrition risk, hiring needs, dan performance trends"
          />
          <AIFeatureCard
            icon={<MessageSquare />}
            title="Smart Chatbot"
            description="Chatbot HR untuk menjawab pertanyaan karyawan 24/7"
          />
          <AIFeatureCard
            icon={<Award />}
            title="Skill Matching"
            description="Matching karyawan dengan project dan opportunity yang sesuai"
          />
        </div>
      </Section>

      {/* Additional Features */}
      <Section spacing="lg" background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Fitur Tambahan
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Calendar />}
            title="Calendar & Events"
            description="Company calendar untuk holiday, events, dan meetings"
          />
          <FeatureCard
            icon={<GitBranch />}
            title="Workflow Builder"
            description="Visual workflow builder untuk custom automation"
          />
          <FeatureCard
            icon={<FileText />}
            title="Reports & Analytics"
            description="Dashboard analytics dan custom reports"
          />
          <FeatureCard
            icon={<Shield />}
            title="Compliance"
            description="Indonesian labor law compliance tools"
          />
          <FeatureCard
            icon={<Globe />}
            title="Multi-language"
            description="Bahasa Indonesia dan English support"
          />
          <FeatureCard
            icon={<Smartphone />}
            title="Mobile App (PWA)"
            description="Progressive Web App untuk mobile access"
          />
        </div>
      </Section>

      {/* Security & Infrastructure */}
      <Section spacing="lg" background="gray">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Security & Infrastructure
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <SecurityCard
            icon={<Lock />}
            title="Enterprise Security"
            items={[
              'End-to-end encryption',
              'Two-factor authentication',
              'Role-based access control',
              'Audit logs',
            ]}
          />
          <SecurityCard
            icon={<Database />}
            title="Data Protection"
            items={[
              'Daily backups',
              'Data encryption at rest',
              'GDPR compliant',
              'ISO 27001 certified',
            ]}
          />
          <SecurityCard
            icon={<Shield />}
            title="Compliance"
            items={[
              'SOC 2 Type II',
              'UU Ketenagakerjaan',
              'Indonesian data residency',
              'Regular security audits',
            ]}
          />
          <SecurityCard
            icon={<BarChart3 />}
            title="Performance"
            items={[
              '99.9% uptime SLA',
              'Fast loading times',
              'CDN delivery',
              'Scalable infrastructure',
            ]}
          />
        </div>
      </Section>

      {/* CTA */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-talixa-gray-900 mb-6">
            Siap Mencoba Semua Fitur?
          </h2>
          <p className="text-xl text-talixa-gray-600 mb-8">
            Dapatkan akses ke semua fitur dengan trial 14 hari gratis
          </p>
          <Button variant="primary" size="xl" href="/pricing">
            Mulai Gratis Sekarang
          </Button>
        </div>
      </Section>
    </>
  );
}

function FeatureModule({
  icon,
  title,
  description,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <Card variant="elevated" padding="lg">
      <div className="text-talixa-blue mb-4">{icon}</div>
      <CardTitle className="text-2xl mb-3">{title}</CardTitle>
      <CardDescription className="mb-6">{description}</CardDescription>
      <ul className="space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-talixa-green flex-shrink-0 mt-0.5" />
            <span className="text-talixa-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function AIFeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card variant="default" padding="lg">
      <div className="h-14 w-14 rounded-lg bg-talixa-purple-50 flex items-center justify-center text-talixa-purple mb-4">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-7 w-7',
        })}
      </div>
      <CardTitle className="text-lg mb-3">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </Card>
  );
}

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
    <Card variant="default" padding="md">
      <div className="text-talixa-blue mb-3">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-8 w-8',
        })}
      </div>
      <CardTitle className="text-lg mb-2">{title}</CardTitle>
      <CardDescription className="text-sm">{description}</CardDescription>
    </Card>
  );
}

function SecurityCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <Card variant="default" padding="lg">
      <div className="text-talixa-blue mb-4">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-10 w-10',
        })}
      </div>
      <CardTitle className="text-lg mb-4">{title}</CardTitle>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-talixa-green flex-shrink-0 mt-0.5" />
            <span className="text-sm text-talixa-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
