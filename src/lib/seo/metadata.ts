import { Metadata } from 'next';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const DEFAULT_SITE_NAME = 'Talixa HRIS';
const DEFAULT_DOMAIN = 'https://talixa.com';
const DEFAULT_IMAGE = `${DEFAULT_DOMAIN}/images/og-default.jpg`;
const DEFAULT_LOCALE = 'id_ID';

/**
 * Generate Next.js Metadata object with comprehensive SEO
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  image = DEFAULT_IMAGE,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}: SEOMetadata): Metadata {
  const fullTitle = `${title} | ${DEFAULT_SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),

    // OpenGraph
    openGraph: {
      title: fullTitle,
      description,
      type,
      locale: DEFAULT_LOCALE,
      siteName: DEFAULT_SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@TalixaHRIS',
      site: '@TalixaHRIS',
    },

    // Additional SEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: 'google-site-verification-code',
      // yandex: 'yandex-verification-code',
      // bing: 'bing-verification-code',
    },

    // Alternates
    alternates: {
      canonical: DEFAULT_DOMAIN,
      languages: {
        'id-ID': DEFAULT_DOMAIN,
        'en-US': `${DEFAULT_DOMAIN}/en`,
      },
    },
  };
}

/**
 * SEO metadata presets for common pages
 */
export const SEOPresets = {
  home: {
    title: 'Platform HRIS Terbaik untuk SMB Indonesia',
    description:
      'Talixa adalah platform HRIS berbasis AI yang membantu SMB di Indonesia mengelola karyawan, absensi, payroll, dan performa dengan mudah. Coba gratis 14 hari!',
    keywords: [
      'HRIS Indonesia',
      'HR software',
      'payroll Indonesia',
      'absensi online',
      'manajemen karyawan',
      'HRIS SMB',
      'HR automation',
      'AI HRIS',
    ],
  },

  features: {
    title: 'Fitur Lengkap HRIS untuk Bisnis Anda',
    description:
      'Kelola seluruh proses HR dalam satu platform: manajemen karyawan, absensi, payroll otomatis, evaluasi performa, dan AI assistant. Lihat semua fitur Talixa.',
    keywords: [
      'fitur HRIS',
      'manajemen karyawan',
      'payroll otomatis',
      'absensi online',
      'evaluasi performa',
      'HR features',
    ],
  },

  pricing: {
    title: 'Harga Terjangkau - Mulai dari Rp 25.000/bulan',
    description:
      'Harga transparan dan terjangkau untuk bisnis berbagai ukuran. Starter Rp 25K, Pro Rp 50K per karyawan/bulan. Gratis 14 hari, tanpa kartu kredit.',
    keywords: [
      'harga HRIS',
      'biaya HR software',
      'HRIS murah',
      'pricing HRIS Indonesia',
      'subscription HR',
    ],
  },

  solutions: {
    title: 'Solusi HRIS untuk Berbagai Industri',
    description:
      'Solusi HRIS yang disesuaikan untuk teknologi, retail, manufacturing, dan lebih. Dari 10 hingga 500+ karyawan.',
    keywords: [
      'HRIS untuk startup',
      'HRIS retail',
      'HRIS manufacturing',
      'HR solution',
      'industri HRIS',
    ],
  },

  about: {
    title: 'Tentang Talixa - Misi & Tim Kami',
    description:
      'Talixa didirikan untuk memberdayakan SMB Indonesia dengan teknologi HR terbaik. Pelajari lebih lanjut tentang misi, visi, dan tim kami.',
    keywords: ['tentang Talixa', 'tim HRIS', 'perusahaan HR tech', 'about us'],
  },

  blog: {
    title: 'Blog - Tips & Insights HR',
    description:
      'Artikel, panduan, dan insights terbaru tentang manajemen HR, payroll, compliance, dan tips produktivitas untuk bisnis Indonesia.',
    keywords: [
      'blog HR',
      'tips manajemen karyawan',
      'payroll tips',
      'HR Indonesia',
      'artikel HR',
    ],
  },

  caseStudies: {
    title: 'Success Stories - Studi Kasus Pelanggan',
    description:
      'Lihat bagaimana perusahaan Indonesia menghemat waktu hingga 80% dan meningkatkan efisiensi HR dengan Talixa.',
    keywords: [
      'case study HRIS',
      'testimoni Talixa',
      'success story',
      'pelanggan Talixa',
    ],
  },

  privacy: {
    title: 'Kebijakan Privasi',
    description:
      'Kebijakan privasi Talixa: bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda sesuai GDPR dan UU PDP.',
    keywords: ['privacy policy', 'kebijakan privasi', 'GDPR', 'UU PDP'],
  },

  terms: {
    title: 'Syarat & Ketentuan Layanan',
    description: 'Syarat dan ketentuan penggunaan platform Talixa HRIS.',
    keywords: ['terms of service', 'syarat ketentuan', 'TOS'],
  },

  security: {
    title: 'Keamanan & Compliance',
    description:
      'Talixa menggunakan enkripsi tingkat enterprise, ISO 27001, SOC 2, dan GDPR compliant. Data Anda aman bersama kami.',
    keywords: [
      'keamanan data',
      'ISO 27001',
      'SOC 2',
      'GDPR',
      'security',
      'compliance',
    ],
  },
};

/**
 * Generate metadata for blog posts
 */
export function generateBlogMetadata({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  tags = [],
  image,
}: {
  title: string;
  description: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  image?: string;
}): Metadata {
  return generateMetadata({
    title,
    description,
    keywords: tags,
    image,
    type: 'article',
    publishedTime,
    modifiedTime,
    author,
    section: 'Blog',
    tags,
  });
}

/**
 * Generate metadata for case studies
 */
export function generateCaseStudyMetadata({
  title,
  description,
  company,
  industry,
  publishedTime,
  image,
}: {
  title: string;
  description: string;
  company: string;
  industry: string;
  publishedTime?: string;
  image?: string;
}): Metadata {
  return generateMetadata({
    title,
    description,
    keywords: [company, industry, 'case study', 'success story', 'Talixa'],
    image,
    type: 'article',
    publishedTime,
    section: 'Case Studies',
  });
}
