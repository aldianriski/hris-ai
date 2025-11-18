'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { Container } from './Container';
import { Menu, X, ChevronDown } from 'lucide-react';

/**
 * Talixa Marketing Header
 *
 * Navigation header for marketing pages.
 * Features: Logo, navigation links, CTA buttons, mobile menu.
 */
export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-talixa-gray-200 shadow-sm">
      <Container>
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-talixa-blue to-talixa-purple flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="text-2xl font-bold text-talixa-gray-900">
              Talixa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink href="/features">Features</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <DropdownNav
              label="Solutions"
              items={[
                { label: 'By Industry', href: '/solutions#industry' },
                { label: 'By Company Size', href: '/solutions#size' },
                { label: 'Use Cases', href: '/solutions#use-cases' },
              ]}
            />
            <NavLink href="/resources">Resources</NavLink>
            <NavLink href="/about">About</NavLink>
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" href="/hr/employees" size="sm">
              Login
            </Button>
            <Button variant="primary" href="/pricing" size="sm">
              Mulai Gratis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-talixa-gray-700 hover:bg-talixa-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-talixa-gray-200">
            <div className="flex flex-col gap-4">
              <MobileNavLink
                href="/features"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </MobileNavLink>
              <MobileNavLink
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </MobileNavLink>
              <MobileNavLink
                href="/solutions"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </MobileNavLink>
              <MobileNavLink
                href="/resources"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </MobileNavLink>
              <MobileNavLink
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </MobileNavLink>

              <div className="pt-4 border-t border-talixa-gray-200 flex flex-col gap-3">
                <Button
                  variant="outline"
                  href="/hr/employees"
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  href="/pricing"
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mulai Gratis
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

// Navigation Link Component
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-talixa-gray-700 hover:text-talixa-blue font-medium transition-colors"
    >
      {children}
    </Link>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className="text-talixa-gray-700 hover:text-talixa-blue font-medium py-2 transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

// Dropdown Navigation Component
function DropdownNav({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 text-talixa-gray-700 hover:text-talixa-blue font-medium transition-colors">
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-talixa-gray-200 py-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-talixa-gray-700 hover:bg-talixa-blue-50 hover:text-talixa-blue transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
