import React from 'react';
import {
  Button,
  Section,
  Card,
  CardTitle,
  CardDescription,
} from '@/components/marketing';
import { BookOpen, FileText, HelpCircle, Video, Download, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Resources | Talixa HRIS',
  description: 'Blog, case studies, help center, templates, dan resources lainnya untuk HR professionals.',
};

export default function ResourcesPage() {
  return (
    <>
      {/* Hero */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-talixa-gray-900 mb-6">
            Resources untuk HR Professionals
          </h1>
          <p className="text-xl text-talixa-gray-600">
            Blog, guides, templates, dan best practices untuk HR management
          </p>
        </div>
      </Section>

      {/* Resource Categories */}
      <Section spacing="lg" background="white">
        <div className="grid md:grid-cols-3 gap-8">
          <ResourceCard
            icon={<BookOpen />}
            title="Blog"
            description="Artikel, tips, dan insights tentang HR management dan people operations"
            link="/resources/blog"
            linkText="Baca Blog"
          />
          <ResourceCard
            icon={<FileText />}
            title="Case Studies"
            description="Success stories dari companies yang menggunakan Talixa"
            link="/resources/case-studies"
            linkText="Lihat Case Studies"
          />
          <ResourceCard
            icon={<HelpCircle />}
            title="Help Center"
            description="Documentation lengkap, FAQs, dan troubleshooting guides"
            link="/resources/help"
            linkText="Get Help"
          />
          <ResourceCard
            icon={<Video />}
            title="Webinars"
            description="Webinar recording tentang HR best practices dan product updates"
            link="/resources/webinars"
            linkText="Watch Webinars"
          />
          <ResourceCard
            icon={<Download />}
            title="HR Templates"
            description="Free downloadable templates untuk onboarding, performance reviews, dll"
            link="/resources/templates"
            linkText="Download Templates"
          />
          <ResourceCard
            icon={<Calendar />}
            title="Events"
            description="Upcoming events, workshops, dan training sessions"
            link="/resources/events"
            linkText="View Events"
          />
        </div>
      </Section>

      {/* Featured Content */}
      <Section spacing="lg" background="gray">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-talixa-gray-900 mb-4">
            Featured Resources
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ContentCard
            type="Blog"
            title="Complete Guide to Indonesian Labor Law 2025"
            description="Everything you need to know about UU Ketenagakerjaan terbaru"
            date="Nov 15, 2025"
            readTime="10 min read"
          />
          <ContentCard
            type="Case Study"
            title="How TechCorp Scaled from 10 to 100 Employees"
            description="Success story menggunakan Talixa untuk rapid growth"
            date="Nov 10, 2025"
            readTime="5 min read"
          />
          <ContentCard
            type="Template"
            title="Employee Onboarding Checklist"
            description="Comprehensive checklist untuk onboarding karyawan baru"
            date="Nov 5, 2025"
            readTime="Download"
          />
        </div>
      </Section>

      {/* Newsletter Signup */}
      <Section spacing="lg" background="white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-talixa-gray-900 mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-lg text-talixa-gray-600 mb-8">
            Dapatkan tips HR, product updates, dan exclusive content langsung ke
            inbox Anda. Weekly newsletter setiap Jumat.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 max-w-md px-4 py-3 rounded-lg border border-talixa-gray-300 focus:border-talixa-blue focus:ring-2 focus:ring-talixa-blue-100 outline-none"
            />
            <Button variant="primary" size="lg" type="submit">
              Subscribe
            </Button>
          </form>
          <p className="text-sm text-talixa-gray-500 mt-4">
            Join 1,000+ HR professionals. Unsubscribe anytime.
          </p>
        </div>
      </Section>
    </>
  );
}

function ResourceCard({
  icon,
  title,
  description,
  link,
  linkText,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
}) {
  return (
    <Card variant="elevated" padding="lg" hoverable>
      <div className="h-14 w-14 rounded-lg bg-talixa-blue-50 flex items-center justify-center text-talixa-blue mb-4">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-7 w-7',
        })}
      </div>
      <CardTitle className="text-xl mb-3">{title}</CardTitle>
      <CardDescription className="mb-6">{description}</CardDescription>
      <Button variant="outline" href={link} size="sm">
        {linkText}
      </Button>
    </Card>
  );
}

function ContentCard({
  type,
  title,
  description,
  date,
  readTime,
}: {
  type: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
}) {
  return (
    <Card variant="default" padding="lg" hoverable>
      <div className="text-xs text-talixa-blue font-semibold mb-2">{type}</div>
      <CardTitle className="text-lg mb-2">{title}</CardTitle>
      <CardDescription className="mb-4">{description}</CardDescription>
      <div className="flex items-center gap-4 text-xs text-talixa-gray-500">
        <span>{date}</span>
        <span>•</span>
        <span>{readTime}</span>
      </div>
    </Card>
  );
}
