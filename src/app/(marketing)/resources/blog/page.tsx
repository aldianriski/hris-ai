import React from 'react';
import { Section, Card, CardTitle, CardDescription, Button } from '@/components/marketing';
import { Calendar, Clock, User } from 'lucide-react';

export const metadata = {
  title: 'Blog | Talixa HRIS',
  description: 'Tips, insights, dan best practices untuk HR management di Indonesia.',
};

export default function BlogPage() {
  return (
    <>
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-talixa-gray-900 mb-6">
            Talixa Blog
          </h1>
          <p className="text-xl text-talixa-gray-600">
            Tips, insights, dan best practices untuk HR professionals
          </p>
        </div>
      </Section>

      <Section spacing="lg" background="white">
        <div className="space-y-8">
          {/* This will be populated from CMS */}
          <BlogPostCard
            title="Complete Guide to Indonesian Labor Law 2025"
            excerpt="Panduan lengkap tentang UU Ketenagakerjaan terbaru yang perlu diketahui setiap HR professional..."
            author="Talixa Team"
            date="Nov 15, 2025"
            readTime="10 min"
            category="Compliance"
          />
          <BlogPostCard
            title="How to Calculate BPJS Correctly in 2025"
            excerpt="Step-by-step guide untuk menghitung BPJS Kesehatan dan Ketenagakerjaan dengan benar..."
            author="Talixa Team"
            date="Nov 12, 2025"
            readTime="8 min"
            category="Payroll"
          />
          <BlogPostCard
            title="10 Best Practices for Remote Team Management"
            excerpt="Tips dan strategi untuk mengelola tim remote dengan efektif di era hybrid work..."
            author="Talixa Team"
            date="Nov 10, 2025"
            readTime="6 min"
            category="Management"
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-talixa-gray-600 mb-4">
            Content will be dynamically loaded from CMS
          </p>
          <Button variant="outline" href="/resources">
            Back to Resources
          </Button>
        </div>
      </Section>
    </>
  );
}

function BlogPostCard({
  title,
  excerpt,
  author,
  date,
  readTime,
  category,
}: {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}) {
  return (
    <Card variant="default" padding="lg" hoverable>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-48 h-48 bg-gradient-to-br from-talixa-blue-100 to-talixa-purple-100 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs text-talixa-blue font-semibold mb-2">
            {category}
          </div>
          <CardTitle className="text-2xl mb-3">{title}</CardTitle>
          <CardDescription className="mb-4">{excerpt}</CardDescription>
          <div className="flex flex-wrap items-center gap-4 text-sm text-talixa-gray-600">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readTime} read</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
