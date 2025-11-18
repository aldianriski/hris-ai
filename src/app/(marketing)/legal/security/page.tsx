import React from 'react';
import { Section, Card, CardTitle, CardDescription } from '@/components/marketing';
import { Shield, Lock, Database, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Security | Talixa HRIS',
  description: 'How we keep your data safe and secure.',
};

export default function SecurityPage() {
  return (
    <>
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-talixa-gray-900 mb-6">
            Security & Compliance
          </h1>
          <p className="text-xl text-talixa-gray-600">
            Enterprise-grade security to protect your most sensitive data
          </p>
        </div>
      </Section>

      <Section spacing="lg" background="white">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card variant="default" padding="lg" className="text-center">
            <Shield className="h-12 w-12 text-talixa-blue mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">ISO 27001</CardTitle>
            <CardDescription className="text-sm">Certified</CardDescription>
          </Card>
          <Card variant="default" padding="lg" className="text-center">
            <Shield className="h-12 w-12 text-talixa-green mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">SOC 2 Type II</CardTitle>
            <CardDescription className="text-sm">Compliant</CardDescription>
          </Card>
          <Card variant="default" padding="lg" className="text-center">
            <Shield className="h-12 w-12 text-talixa-purple mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">GDPR</CardTitle>
            <CardDescription className="text-sm">Compliant</CardDescription>
          </Card>
          <Card variant="default" padding="lg" className="text-center">
            <Shield className="h-12 w-12 text-talixa-gold mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">99.9% Uptime</CardTitle>
            <CardDescription className="text-sm">SLA</CardDescription>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <SecuritySection
            icon={<Lock />}
            title="Data Encryption"
            items={[
              'End-to-end encryption for all data',
              'TLS 1.3 for data in transit',
              'AES-256 encryption at rest',
              'Encrypted backups',
            ]}
          />

          <SecuritySection
            icon={<Database />}
            title="Infrastructure Security"
            items={[
              'Data centers in Indonesia',
              'Regular security audits',
              'DDoS protection',
              'Automatic security updates',
            ]}
          />

          <SecuritySection
            icon={<CheckCircle />}
            title="Access Controls"
            items={[
              'Two-factor authentication (2FA)',
              'Role-based access control (RBAC)',
              'Single Sign-On (SSO) support',
              'Audit logs for all activities',
            ]}
          />

          <SecuritySection
            icon={<Shield />}
            title="Compliance"
            items={[
              'GDPR compliant',
              'Indonesian UU PDP compliant',
              'Regular penetration testing',
              'Security awareness training',
            ]}
          />
        </div>
      </Section>

      <Section spacing="lg" background="gray">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-talixa-gray-900 mb-4">
            Security Questions?
          </h2>
          <p className="text-lg text-talixa-gray-600 mb-6">
            Our security team is here to help
          </p>
          <p className="text-talixa-gray-700">
            Email: security@talixa.com
          </p>
        </div>
      </Section>
    </>
  );
}

function SecuritySection({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-lg bg-talixa-blue-50 flex items-center justify-center text-talixa-blue">
          {React.cloneElement(icon as React.ReactElement, {
            className: 'h-6 w-6',
          })}
        </div>
        <h2 className="text-2xl font-bold text-talixa-gray-900">{title}</h2>
      </div>
      <ul className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-talixa-green flex-shrink-0 mt-0.5" />
            <span className="text-talixa-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
