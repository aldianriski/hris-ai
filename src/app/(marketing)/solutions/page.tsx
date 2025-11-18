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
  Building2,
  ShoppingCart,
  Factory,
  Users,
  TrendingUp,
  Rocket,
  CheckCircle,
} from 'lucide-react';

export const metadata = {
  title: 'Solutions | Talixa HRIS',
  description: 'Solusi HRIS yang disesuaikan untuk berbagai industri, ukuran perusahaan, dan use case.',
};

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-talixa-gray-900 mb-6">
            Solusi untuk Setiap Bisnis
          </h1>
          <p className="text-xl text-talixa-gray-600 mb-8">
            HRIS yang dapat disesuaikan dengan kebutuhan industri, ukuran
            perusahaan, dan use case Anda
          </p>
          <Button variant="primary" size="lg" href="/pricing">
            Mulai Gratis 14 Hari
          </Button>
        </div>
      </Section>

      {/* By Industry */}
      <Section spacing="lg" background="white" id="industry">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Solusi Berdasarkan Industri
          </h2>
          <p className="text-xl text-talixa-gray-600">
            Disesuaikan dengan kebutuhan spesifik industri Anda
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <IndustryCard
            icon={<Building2 />}
            title="Tech & Startups"
            description="Kelola tim remote, flexible benefits, dan rapid scaling"
            challenges={[
              'Tim remote & distributed',
              'Rapid hiring & scaling',
              'Flexible work arrangements',
            ]}
            solutions={[
              'Remote attendance tracking',
              'Automated onboarding',
              'Performance OKRs',
              'Equity management',
            ]}
          />

          <IndustryCard
            icon={<ShoppingCart />}
            title="Retail"
            description="Manage shift workers, multiple locations, dan seasonal hiring"
            challenges={[
              'Multiple locations',
              'Shift scheduling',
              'High turnover rate',
            ]}
            solutions={[
              'Shift management',
              'GPS attendance',
              'Quick onboarding',
              'Payroll automation',
            ]}
          />

          <IndustryCard
            icon={<Factory />}
            title="Manufacturing"
            description="Track production workers, safety compliance, dan overtime"
            challenges={[
              'Blue collar workers',
              'Safety compliance',
              'Overtime tracking',
            ]}
            solutions={[
              'Biometric attendance',
              'Safety training tracking',
              'Overtime calculator',
              'Shift premiums',
            ]}
          />
        </div>
      </Section>

      {/* By Company Size */}
      <Section spacing="lg" background="gray" id="size">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Solusi Berdasarkan Ukuran Perusahaan
          </h2>
          <p className="text-xl text-talixa-gray-600">
            Dari startup hingga enterprise
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <CompanySizeCard
            size="10-50 Karyawan"
            title="Small Business"
            description="Setup cepat, mudah digunakan, affordable"
            features={[
              'Setup dalam 5 menit',
              'Self-service onboarding',
              'Basic HR features',
              'Email support',
            ]}
            price="Mulai Rp 250K/bulan"
            recommended="Starter"
          />

          <CompanySizeCard
            size="50-200 Karyawan"
            title="Growing Business"
            description="Fitur lengkap untuk perusahaan yang berkembang"
            features={[
              'Payroll & benefits',
              'Performance management',
              'Advanced analytics',
              'Priority support',
            ]}
            price="Mulai Rp 2.5 Jt/bulan"
            recommended="Pro"
            highlighted
          />

          <CompanySizeCard
            size="200-500+ Karyawan"
            title="Enterprise"
            description="Custom solution dengan dedicated support"
            features={[
              'Custom integration',
              'Dedicated account manager',
              'SLA guarantee',
              '24/7 support',
            ]}
            price="Custom pricing"
            recommended="Enterprise"
          />
        </div>
      </Section>

      {/* By Use Case */}
      <Section spacing="lg" background="white" id="use-cases">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Solusi Berdasarkan Use Case
          </h2>
        </div>

        <div className="space-y-8">
          <UseCaseCard
            icon={<Rocket />}
            title="Startup: From 0 to 50 Employees"
            challenge="Anda baru mulai hire karyawan dan butuh sistem HR yang simple tapi scalable"
            solution="Talixa menyediakan setup cepat dengan automated onboarding, attendance tracking, dan basic payroll. Fokus ke growth, biarkan HR berjalan otomatis."
            features={[
              'Quick setup (5 menit)',
              'Digital onboarding',
              'Leave management',
              'Payslip generation',
              'Compliance checklist',
            ]}
            cta="Mulai Gratis"
            href="/pricing"
          />

          <UseCaseCard
            icon={<TrendingUp />}
            title="Scaling: Growing from 50 to 200+"
            challenge="Tim HR Anda overwhelmed dengan manual processes dan butuh automation"
            solution="Automate payroll, performance reviews, dan analytics dengan AI. Workflow builder untuk custom automation sesuai kebutuhan perusahaan Anda."
            features={[
              'Automated payroll',
              'Performance management',
              'AI-powered insights',
              'Custom workflows',
              'Advanced analytics',
            ]}
            cta="Lihat Demo"
            href="/resources/demo"
          />

          <UseCaseCard
            icon={<Users />}
            title="Enterprise: 200+ Employees"
            challenge="Butuh HRIS yang bisa handle kompleksitas organisasi besar dengan multiple entities"
            solution="Enterprise features dengan multi-entity support, custom integration, dedicated support, dan SLA guarantee. White-glove onboarding dan training."
            features={[
              'Multi-entity support',
              'Custom SSO integration',
              'Dedicated support',
              'Custom training',
              'SLA 99.9%',
            ]}
            cta="Hubungi Sales"
            href="/contact"
          />
        </div>
      </Section>

      {/* Success Stories */}
      <Section spacing="lg" background="gradient">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-talixa-gray-900 mb-4">
            Success Stories
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card variant="elevated" padding="lg">
            <div className="mb-4">
              <div className="text-sm text-talixa-blue font-semibold mb-2">
                Tech Startup
              </div>
              <CardTitle className="text-xl mb-2">
                "Dari 10 ke 100 karyawan dalam 1 tahun"
              </CardTitle>
            </div>
            <CardDescription className="mb-6">
              TechCorp menggunakan Talixa untuk scaling dari 10 ke 100 karyawan.
              Automated onboarding menghemat 80% waktu HR, dan self-service
              portal mengurangi HR tickets sebesar 60%.
            </CardDescription>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-talixa-green">80%</div>
                <div className="text-talixa-gray-600">Time Saved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-talixa-green">60%</div>
                <div className="text-talixa-gray-600">Fewer Tickets</div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="mb-4">
              <div className="text-sm text-talixa-purple font-semibold mb-2">
                Retail Chain
              </div>
              <CardTitle className="text-xl mb-2">
                "Manage 50+ locations dengan mudah"
              </CardTitle>
            </div>
            <CardDescription className="mb-6">
              RetailCo mengelola 300+ karyawan di 50 locations. GPS attendance
              dan automated shift scheduling menghemat 15 jam per minggu untuk
              HR manager.
            </CardDescription>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-talixa-green">15h</div>
                <div className="text-talixa-gray-600">Per Week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-talixa-green">100%</div>
                <div className="text-talixa-gray-600">Accurate</div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* CTA */}
      <Section spacing="xl" background="white">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-talixa-gray-900 mb-6">
            Temukan Solusi yang Tepat untuk Bisnis Anda
          </h2>
          <p className="text-xl text-talixa-gray-600 mb-8">
            Jadwalkan demo dengan tim kami untuk mendiskusikan kebutuhan
            spesifik perusahaan Anda
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" href="/resources/demo">
              Jadwalkan Demo
            </Button>
            <Button variant="outline" size="lg" href="/pricing">
              Lihat Pricing
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

function IndustryCard({
  icon,
  title,
  description,
  challenges,
  solutions,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  challenges: string[];
  solutions: string[];
}) {
  return (
    <Card variant="elevated" padding="lg">
      <div className="h-14 w-14 rounded-lg bg-talixa-blue-50 flex items-center justify-center text-talixa-blue mb-4">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-7 w-7',
        })}
      </div>
      <CardTitle className="text-xl mb-2">{title}</CardTitle>
      <CardDescription className="mb-6">{description}</CardDescription>

      <div className="mb-4">
        <h4 className="font-semibold text-sm text-talixa-gray-900 mb-2">
          Challenges:
        </h4>
        <ul className="space-y-1">
          {challenges.map((challenge) => (
            <li
              key={challenge}
              className="text-sm text-talixa-gray-600 flex items-start gap-2"
            >
              <span className="text-talixa-gray-400">•</span>
              {challenge}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-talixa-gray-900 mb-2">
          Solutions:
        </h4>
        <ul className="space-y-2">
          {solutions.map((solution) => (
            <li key={solution} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-talixa-green flex-shrink-0 mt-0.5" />
              <span className="text-sm text-talixa-gray-700">{solution}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function CompanySizeCard({
  size,
  title,
  description,
  features,
  price,
  recommended,
  highlighted = false,
}: {
  size: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  recommended: string;
  highlighted?: boolean;
}) {
  return (
    <Card
      variant={highlighted ? 'bordered' : 'elevated'}
      padding="lg"
      className={highlighted ? 'transform scale-105' : ''}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-talixa-green text-white px-4 py-1 rounded-full text-sm font-semibold">
          Popular
        </div>
      )}
      <div className="text-talixa-blue text-sm font-semibold mb-2">{size}</div>
      <CardTitle className="text-2xl mb-2">{title}</CardTitle>
      <CardDescription className="mb-6">{description}</CardDescription>

      <ul className="space-y-3 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-talixa-green flex-shrink-0 mt-0.5" />
            <span className="text-sm text-talixa-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-talixa-gray-200 pt-4 mb-4">
        <div className="text-sm text-talixa-gray-600 mb-1">Starting from</div>
        <div className="text-2xl font-bold text-talixa-gray-900 mb-2">
          {price}
        </div>
        <div className="text-sm text-talixa-blue">
          Recommended: {recommended}
        </div>
      </div>

      <Button variant="outline" href="/pricing" fullWidth>
        Lihat Pricing
      </Button>
    </Card>
  );
}

function UseCaseCard({
  icon,
  title,
  challenge,
  solution,
  features,
  cta,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  challenge: string;
  solution: string;
  features: string[];
  cta: string;
  href: string;
}) {
  return (
    <Card variant="elevated" padding="lg">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-talixa-purple-50 flex items-center justify-center text-talixa-purple flex-shrink-0">
              {React.cloneElement(icon as React.ReactElement, {
                className: 'h-6 w-6',
              })}
            </div>
            <div>
              <CardTitle className="text-2xl mb-2">{title}</CardTitle>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-talixa-gray-900 mb-2">
                Challenge:
              </h4>
              <p className="text-talixa-gray-600">{challenge}</p>
            </div>

            <div>
              <h4 className="font-semibold text-talixa-gray-900 mb-2">
                Solution:
              </h4>
              <p className="text-talixa-gray-600">{solution}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-talixa-gray-900 mb-3">
            Key Features:
          </h4>
          <ul className="space-y-2 mb-6">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-talixa-green flex-shrink-0 mt-0.5" />
                <span className="text-sm text-talixa-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <Button variant="primary" href={href} fullWidth>
            {cta}
          </Button>
        </div>
      </div>
    </Card>
  );
}
