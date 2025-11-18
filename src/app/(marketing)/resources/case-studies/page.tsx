import React from 'react';
import { Section, Card, CardTitle, CardDescription } from '@/components/marketing';
import { Building2, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Case Studies | Talixa HRIS',
  description: 'Customer success stories dari perusahaan yang menggunakan Talixa.',
};

export default function CaseStudiesPage() {
  return (
    <>
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-talixa-gray-900 mb-6">
            Customer Success Stories
          </h1>
          <p className="text-xl text-talixa-gray-600">
            Lihat bagaimana perusahaan lain berhasil dengan Talixa
          </p>
        </div>
      </Section>

      <Section spacing="lg" background="white">
        <div className="grid md:grid-cols-2 gap-8">
          <CaseStudyCard
            industry="Tech Startup"
            company="TechCorp"
            employees="100"
            title="Scaling from 10 to 100 Employees in 1 Year"
            results={[
              '80% time saved on HR tasks',
              '60% fewer HR tickets',
              '100% compliant payroll',
            ]}
          />
          <CaseStudyCard
            industry="Retail"
            company="RetailCo"
            employees="300"
            title="Managing 50+ Locations with Ease"
            results={[
              '15h saved per week',
              '100% accurate attendance',
              'Zero payroll errors',
            ]}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-talixa-gray-600">
            More case studies will be loaded from CMS
          </p>
        </div>
      </Section>
    </>
  );
}

function CaseStudyCard({
  industry,
  company,
  employees,
  title,
  results,
}: {
  industry: string;
  company: string;
  employees: string;
  title: string;
  results: string[];
}) {
  return (
    <Card variant="elevated" padding="lg" hoverable>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-lg bg-talixa-purple-50 flex items-center justify-center">
          <Building2 className="h-6 w-6 text-talixa-purple" />
        </div>
        <div>
          <div className="text-sm text-talixa-blue font-semibold">{industry}</div>
          <div className="text-sm text-talixa-gray-600">
            {company} • {employees} employees
          </div>
        </div>
      </div>
      <CardTitle className="text-xl mb-4">{title}</CardTitle>
      <div className="space-y-2">
        {results.map((result, i) => (
          <div key={i} className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-talixa-green flex-shrink-0 mt-0.5" />
            <span className="text-sm text-talixa-gray-700">{result}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
