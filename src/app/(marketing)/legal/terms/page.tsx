import React from 'react';
import { Section } from '@/components/marketing';

export const metadata = {
  title: 'Terms of Service | Talixa HRIS',
  description: 'Talixa Terms of Service and user agreement.',
};

export default function TermsPage() {
  return (
    <>
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-talixa-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-lg text-talixa-gray-600">
            Last updated: November 18, 2025
          </p>
        </div>
      </Section>

      <Section spacing="lg" background="white">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing and using Talixa HRIS, you agree to be bound by these Terms
            of Service and all applicable laws and regulations.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily access and use Talixa for HR
            management purposes, subject to the restrictions in these terms.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access</li>
            <li>Interfere with the service's operation</li>
            <li>Upload malicious code or content</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>

          <h2>4. Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the security of your account and for
            all activities that occur under your account.
          </p>

          <h2>5. Payment Terms</h2>
          <p>
            Subscription fees are billed in advance on a monthly or annual basis. All
            fees are non-refundable except as required by law.
          </p>

          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violations of
            these terms. You may cancel your subscription at any time.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            Talixa shall not be liable for any indirect, incidental, or consequential
            damages arising from your use of the service.
          </p>

          <h2>8. Contact</h2>
          <p>
            For questions about these Terms, contact us at: legal@talixa.com
          </p>
        </div>
      </Section>
    </>
  );
}
