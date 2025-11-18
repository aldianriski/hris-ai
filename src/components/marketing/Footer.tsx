import React from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail } from 'lucide-react';

/**
 * Talixa Marketing Footer
 *
 * Footer for marketing pages with links and social media.
 */
export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-talixa-gray-900 text-white">
      <Container>
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-talixa-blue to-talixa-purple flex items-center justify-center text-white font-bold text-xl">
                  T
                </div>
                <span className="text-2xl font-bold">Talixa</span>
              </Link>
              <p className="text-talixa-gray-300 mb-6 max-w-sm">
                HRIS Pintar untuk Bisnis Indonesia. Kelola karyawan dengan mudah
                menggunakan AI. Hemat waktu, tingkatkan produktivitas.
              </p>

              {/* Social Links */}
              <div className="flex gap-4">
                <SocialLink
                  href="https://facebook.com/talixa"
                  icon={<Facebook className="h-5 w-5" />}
                  label="Facebook"
                />
                <SocialLink
                  href="https://twitter.com/talixa"
                  icon={<Twitter className="h-5 w-5" />}
                  label="Twitter"
                />
                <SocialLink
                  href="https://linkedin.com/company/talixa"
                  icon={<Linkedin className="h-5 w-5" />}
                  label="LinkedIn"
                />
                <SocialLink
                  href="https://instagram.com/talixa"
                  icon={<Instagram className="h-5 w-5" />}
                  label="Instagram"
                />
                <SocialLink
                  href="https://youtube.com/talixa"
                  icon={<Youtube className="h-5 w-5" />}
                  label="YouTube"
                />
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-3">
                <FooterLink href="/features">Features</FooterLink>
                <FooterLink href="/pricing">Pricing</FooterLink>
                <FooterLink href="/solutions">Solutions</FooterLink>
                <FooterLink href="/integrations">Integrations</FooterLink>
                <FooterLink href="/changelog">Changelog</FooterLink>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                <FooterLink href="/about">About Us</FooterLink>
                <FooterLink href="/about/team">Team</FooterLink>
                <FooterLink href="/about/careers">Careers</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
                <FooterLink href="/press">Press Kit</FooterLink>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-3">
                <FooterLink href="/resources/blog">Blog</FooterLink>
                <FooterLink href="/resources/case-studies">
                  Case Studies
                </FooterLink>
                <FooterLink href="/resources/help">Help Center</FooterLink>
                <FooterLink href="/resources/webinars">Webinars</FooterLink>
                <FooterLink href="/resources/templates">
                  HR Templates
                </FooterLink>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-talixa-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <p className="text-talixa-gray-400 text-sm">
                © {currentYear} Talixa HRIS. All rights reserved.
              </p>

              {/* Legal Links */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <FooterLink href="/legal/privacy">Privacy Policy</FooterLink>
                <FooterLink href="/legal/terms">Terms of Service</FooterLink>
                <FooterLink href="/legal/security">Security</FooterLink>
                <FooterLink href="/legal/dpa">DPA</FooterLink>
              </div>

              {/* Compliance Badges */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-talixa-gray-400 px-2 py-1 bg-talixa-gray-800 rounded">
                  ISO 27001
                </span>
                <span className="text-xs text-talixa-gray-400 px-2 py-1 bg-talixa-gray-800 rounded">
                  SOC 2
                </span>
                <span className="text-xs text-talixa-gray-400 px-2 py-1 bg-talixa-gray-800 rounded">
                  GDPR
                </span>
              </div>
            </div>

            {/* Indonesia Flag & Location */}
            <div className="mt-6 text-center">
              <p className="text-talixa-gray-400 text-sm">
                🇮🇩 Proudly made in Indonesia | Built for Indonesian businesses
              </p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

// Footer Link Component
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-talixa-gray-300 hover:text-white transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

// Social Link Component
function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-talixa-gray-400 hover:text-white transition-colors"
      aria-label={label}
    >
      {icon}
    </a>
  );
}
