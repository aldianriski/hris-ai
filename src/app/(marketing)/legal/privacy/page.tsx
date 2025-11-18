import React from 'react';
import { Section, Container } from '@/components/marketing';

export const metadata = {
  title: 'Privacy Policy | Talixa HRIS',
  description: 'Talixa privacy policy - How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-talixa-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-talixa-gray-600">
            Last updated: November 18, 2025
          </p>
        </div>
      </Section>

      <Section spacing="lg" background="white">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2>1. Introduction</h2>
          <p>
            At Talixa, we take your privacy seriously. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you
            use our HRIS platform.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Information You Provide</h3>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Company information (company name, address, industry)</li>
            <li>Employee data (names, contact info, employment details)</li>
            <li>Payment information (processed securely by our payment providers)</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <p>
            When you use our services, we automatically collect:
          </p>
          <ul>
            <li>Log data (IP address, browser type, pages visited)</li>
            <li>Device information</li>
            <li>Usage data and analytics</li>
            <li>Cookies and similar technologies</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process transactions and send notifications</li>
            <li>Improve and optimize our platform</li>
            <li>Provide customer support</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect
            your data, including:
          </p>
          <ul>
            <li>End-to-end encryption</li>
            <li>Secure data centers in Indonesia</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
            <li>Employee training on data protection</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfill the
            purposes outlined in this policy, unless a longer retention period is
            required by law.
          </p>

          <h2>6. Your Rights</h2>
          <p>Under GDPR and Indonesian data protection laws, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>

          <h2>7. International Data Transfers</h2>
          <p>
            Your data is primarily stored in Indonesia. If we transfer data
            internationally, we ensure appropriate safeguards are in place.
          </p>

          <h2>8. Cookies</h2>
          <p>
            We use cookies and similar technologies to improve your experience. You
            can control cookies through your browser settings.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you
            of any changes by posting the new policy on this page.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@talixa.com</li>
            <li>Address: Jakarta, Indonesia</li>
          </ul>
        </div>
      </Section>
    </>
  );
}
