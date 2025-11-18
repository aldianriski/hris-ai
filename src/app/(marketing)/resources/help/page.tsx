import React from 'react';
import { Section, Card, CardTitle, CardDescription } from '@/components/marketing';
import { Search, Book, MessageSquare, Video, FileText, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Help Center | Talixa HRIS',
  description: 'Documentation, FAQs, dan support untuk Talixa HRIS.',
};

export default function HelpPage() {
  return (
    <>
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-talixa-gray-900 mb-6">
            How Can We Help?
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-talixa-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-talixa-gray-300 focus:border-talixa-blue focus:ring-2 focus:ring-talixa-blue-100 outline-none text-lg"
            />
          </div>
        </div>
      </Section>

      <Section spacing="lg" background="white">
        <div className="grid md:grid-cols-3 gap-8">
          <HelpCard
            icon={<Book />}
            title="Getting Started"
            description="Setup guide, onboarding, dan basic configuration"
            articles={12}
          />
          <HelpCard
            icon={<FileText />}
            title="Features & Usage"
            description="How-to guides untuk setiap feature"
            articles={45}
          />
          <HelpCard
            icon={<Video />}
            title="Video Tutorials"
            description="Step-by-step video guides"
            articles={20}
          />
          <HelpCard
            icon={<HelpCircle />}
            title="FAQs"
            description="Pertanyaan yang sering diajukan"
            articles={30}
          />
          <HelpCard
            icon={<MessageSquare />}
            title="Troubleshooting"
            description="Common issues dan solutions"
            articles={25}
          />
          <HelpCard
            icon={<Book />}
            title="API Docs"
            description="Developer documentation"
            articles={15}
          />
        </div>
      </Section>

      <Section spacing="lg" background="gray">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-talixa-gray-900 mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-talixa-gray-600 mb-6">
            Our support team is here to help
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Card variant="default" padding="md" className="text-center">
              <MessageSquare className="h-8 w-8 text-talixa-blue mx-auto mb-2" />
              <div className="font-semibold mb-1">Live Chat</div>
              <div className="text-sm text-talixa-gray-600">Available 9am-6pm</div>
            </Card>
            <Card variant="default" padding="md" className="text-center">
              <FileText className="h-8 w-8 text-talixa-green mx-auto mb-2" />
              <div className="font-semibold mb-1">Email Support</div>
              <div className="text-sm text-talixa-gray-600">support@talixa.com</div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}

function HelpCard({
  icon,
  title,
  description,
  articles,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  articles: number;
}) {
  return (
    <Card variant="default" padding="lg" hoverable>
      <div className="text-talixa-blue mb-4">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-8 w-8',
        })}
      </div>
      <CardTitle className="text-lg mb-2">{title}</CardTitle>
      <CardDescription className="mb-3">{description}</CardDescription>
      <div className="text-sm text-talixa-gray-500">{articles} articles</div>
    </Card>
  );
}
