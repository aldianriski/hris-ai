import React from 'react';
import {
  Button,
  Section,
  Container,
  Card,
  CardTitle,
  CardDescription,
} from '@/components/marketing';
import { Heart, Target, Eye, Zap, Users, Mail, MapPin, Phone } from 'lucide-react';

export const metadata = {
  title: 'About Us | Talixa HRIS',
  description: 'Talixa adalah HRIS pintar untuk bisnis Indonesia. Dibuat dengan ❤️ di Indonesia untuk perusahaan Indonesia.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-talixa-gray-900 mb-6">
            Dibuat dengan ❤️ di Indonesia
          </h1>
          <p className="text-xl text-talixa-gray-600 mb-8">
            Kami adalah tim yang passionate untuk membuat HR management lebih
            mudah, efisien, dan affordable untuk bisnis Indonesia
          </p>
        </div>
      </Section>

      {/* Our Story */}
      <Section spacing="lg" background="white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-talixa-gray-900 mb-4">
              Cerita Kami
            </h2>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-talixa-gray-700 mb-6">
              Talixa dimulai dari pengalaman pribadi kami sebagai founder dan HR
              manager di berbagai perusahaan tech di Indonesia. Kami melihat
              bagaimana tim HR menghabiskan puluhan jam setiap minggu untuk
              tugas-tugas manual seperti menghitung gaji, approve cuti, dan
              membuat laporan.
            </p>

            <p className="text-lg text-talixa-gray-700 mb-6">
              Di sisi lain, solusi HRIS yang ada di pasaran terlalu mahal dan
              kompleks untuk SMB Indonesia. Kebanyakan dibuat untuk perusahaan
              besar dengan budget unlimited. Kami percaya setiap bisnis, besar
              atau kecil, berhak mendapatkan tools yang powerful untuk mengelola
              tim mereka.
            </p>

            <p className="text-lg text-talixa-gray-700 mb-6">
              Maka lahirlah Talixa - HRIS yang powerful namun simple, affordable
              namun feature-rich, dan yang paling penting: dibuat khusus untuk
              bisnis Indonesia dengan pemahaman mendalam tentang UU
              Ketenagakerjaan, BPJS, dan kultur kerja Indonesia.
            </p>
          </div>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section spacing="lg" background="blue">
        <div className="grid md:grid-cols-3 gap-8">
          <Card variant="elevated" padding="lg">
            <div className="h-14 w-14 rounded-lg bg-talixa-blue-50 flex items-center justify-center text-talixa-blue mb-4">
              <Heart className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl mb-3">Mission</CardTitle>
            <CardDescription>
              Empowering Indonesian SMBs dengan intelligent, affordable, dan
              compliant HR management tools
            </CardDescription>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="h-14 w-14 rounded-lg bg-talixa-green-50 flex items-center justify-center text-talixa-green mb-4">
              <Target className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl mb-3">Vision</CardTitle>
            <CardDescription>
              Menjadi #1 HRIS solution untuk Indonesian SMBs pada 2027, melayani
              10,000+ perusahaan dan 500,000+ karyawan
            </CardDescription>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="h-14 w-14 rounded-lg bg-talixa-purple-50 flex items-center justify-center text-talixa-purple mb-4">
              <Zap className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl mb-3">Values</CardTitle>
            <CardDescription>
              Innovation, Simplicity, Trust, Empowerment, dan Local-First
              approach dalam setiap keputusan kami
            </CardDescription>
          </Card>
        </div>
      </Section>

      {/* Stats */}
      <Section spacing="lg" background="white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-talixa-blue mb-2">1,000+</div>
            <div className="text-talixa-gray-600">Companies</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-talixa-green mb-2">50,000+</div>
            <div className="text-talixa-gray-600">Employees</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-talixa-purple mb-2">15h</div>
            <div className="text-talixa-gray-600">Saved per Week</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-talixa-gold mb-2">4.8/5</div>
            <div className="text-talixa-gray-600">Customer Rating</div>
          </div>
        </div>
      </Section>

      {/* Team */}
      <Section spacing="lg" background="gray">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-talixa-gray-900 mb-4">
            Meet the Team
          </h2>
          <p className="text-xl text-talixa-gray-600">
            Passionate people building for Indonesian businesses
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <TeamMember
            name="Founder & CEO"
            role="Product & Strategy"
            description="10+ years building tech products, ex-Gojek"
          />
          <TeamMember
            name="Co-Founder & CTO"
            role="Engineering"
            description="Tech lead with experience scaling systems"
          />
          <TeamMember
            name="Head of Product"
            role="Product Design"
            description="Former HR manager turned product designer"
          />
        </div>

        <div className="mt-12 text-center">
          <Button variant="primary" size="lg" href="/about/careers">
            Join Our Team
          </Button>
        </div>
      </Section>

      {/* Contact */}
      <Section spacing="lg" background="white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-talixa-gray-900 mb-4">
            Get in Touch
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card variant="default" padding="lg">
            <div className="text-talixa-blue mb-4">
              <Mail className="h-8 w-8 mx-auto" />
            </div>
            <CardTitle className="text-lg text-center mb-2">Email</CardTitle>
            <CardDescription className="text-center">
              <a
                href="mailto:hello@talixa.com"
                className="text-talixa-blue hover:underline"
              >
                hello@talixa.com
              </a>
            </CardDescription>
          </Card>

          <Card variant="default" padding="lg">
            <div className="text-talixa-blue mb-4">
              <Phone className="h-8 w-8 mx-auto" />
            </div>
            <CardTitle className="text-lg text-center mb-2">Phone</CardTitle>
            <CardDescription className="text-center">
              <a
                href="tel:+622150903000"
                className="text-talixa-blue hover:underline"
              >
                +62 21 5090 3000
              </a>
            </CardDescription>
          </Card>

          <Card variant="default" padding="lg">
            <div className="text-talixa-blue mb-4">
              <MapPin className="h-8 w-8 mx-auto" />
            </div>
            <CardTitle className="text-lg text-center mb-2">Office</CardTitle>
            <CardDescription className="text-center">
              Jakarta, Indonesia
            </CardDescription>
          </Card>
        </div>
      </Section>

      {/* CTA */}
      <Section spacing="xl" background="gradient">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-talixa-gray-900 mb-6">
            Ready to Transform Your HR?
          </h2>
          <p className="text-xl text-talixa-gray-600 mb-8">
            Join 1,000+ companies using Talixa
          </p>
          <Button variant="primary" size="xl" href="/pricing">
            Mulai Gratis 14 Hari
          </Button>
        </div>
      </Section>
    </>
  );
}

function TeamMember({
  name,
  role,
  description,
}: {
  name: string;
  role: string;
  description: string;
}) {
  return (
    <Card variant="elevated" padding="lg">
      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-talixa-blue to-talixa-purple mx-auto mb-4 flex items-center justify-center">
        <Users className="h-16 w-16 text-white" />
      </div>
      <CardTitle className="text-lg text-center mb-1">{name}</CardTitle>
      <div className="text-sm text-talixa-blue text-center mb-3">{role}</div>
      <CardDescription className="text-center text-sm">
        {description}
      </CardDescription>
    </Card>
  );
}
