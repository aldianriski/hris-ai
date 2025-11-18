import { Thing, WithContext } from 'schema-dts';

/**
 * Schema.org structured data helpers for SEO
 * https://schema.org/
 */

/**
 * Organization schema for Talixa
 */
export function generateOrganizationSchema(): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Talixa',
    legalName: 'PT Talixa Indonesia',
    url: 'https://talixa.com',
    logo: 'https://talixa.com/images/logo.png',
    description:
      'Platform HRIS berbasis AI untuk SMB di Indonesia. Kelola karyawan, absensi, payroll, dan performa dengan mudah.',
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'Founder Name',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jakarta',
      addressLocality: 'Jakarta',
      addressCountry: 'ID',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+62-xxx-xxxx-xxxx',
        contactType: 'Customer Service',
        email: 'support@talixa.com',
        areaServed: 'ID',
        availableLanguage: ['Indonesian', 'English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+62-xxx-xxxx-xxxx',
        contactType: 'Sales',
        email: 'sales@talixa.com',
        areaServed: 'ID',
        availableLanguage: ['Indonesian', 'English'],
      },
    ],
    sameAs: [
      'https://www.linkedin.com/company/talixa',
      'https://twitter.com/TalixaHRIS',
      'https://www.facebook.com/TalixaHRIS',
      'https://www.instagram.com/talixa.hris',
    ],
  };
}

/**
 * SoftwareApplication schema for Talixa product
 */
export function generateSoftwareApplicationSchema(): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Talixa HRIS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '25000',
      priceCurrency: 'IDR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '25000',
        priceCurrency: 'IDR',
        unitText: 'per employee per month',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    description:
      'Platform HRIS berbasis AI untuk mengelola karyawan, absensi, payroll, dan performa. Mudah digunakan, terjangkau, dan disesuaikan untuk SMB Indonesia.',
    screenshot: 'https://talixa.com/images/screenshots/dashboard.png',
    featureList: [
      'Manajemen Karyawan',
      'Absensi & Time Tracking',
      'Payroll Otomatis',
      'Evaluasi Performa',
      'AI Assistant',
      'Self-Service Portal',
      'Multi-location Support',
      'Compliance Indonesia',
    ],
  };
}

/**
 * Breadcrumb schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Article schema for blog posts
 */
export function generateArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  url,
}: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author || 'Talixa Team',
      url: 'https://talixa.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Talixa',
      logo: {
        '@type': 'ImageObject',
        url: 'https://talixa.com/images/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * FAQ schema for FAQ pages
 */
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Product schema with pricing
 */
export function generateProductSchema({
  name,
  description,
  image,
  price,
  priceCurrency = 'IDR',
  availability = 'InStock',
  url,
}: {
  name: string;
  description: string;
  image: string;
  price: string;
  priceCurrency?: string;
  availability?: string;
  url: string;
}): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: 'Talixa',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency,
      price,
      availability: `https://schema.org/${availability}`,
      priceValidUntil: '2025-12-31',
      seller: {
        '@type': 'Organization',
        name: 'Talixa',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
  };
}

/**
 * Review schema for testimonials
 */
export function generateReviewSchema({
  itemReviewed,
  author,
  reviewRating,
  reviewBody,
  datePublished,
}: {
  itemReviewed: string;
  author: string;
  reviewRating: number;
  reviewBody: string;
  datePublished: string;
}): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: itemReviewed,
    },
    author: {
      '@type': 'Person',
      name: author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: reviewRating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody,
    datePublished,
  };
}

/**
 * VideoObject schema for video content
 */
export function generateVideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string; // ISO 8601 format (e.g., "PT2M30S" for 2:30)
  contentUrl: string;
}): WithContext<Thing> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    contentUrl,
  };
}

/**
 * Helper to inject structured data into pages
 */
export function StructuredData({ data }: { data: WithContext<Thing> | WithContext<Thing>[] }) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
