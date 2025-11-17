import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Core */
  reactStrictMode: true,

  /* TypeScript */
  typescript: {
    ignoreBuildErrors: false,
  },

  /* ESLint */
  eslint: {
    ignoreDuringBuilds: false,
  },

  /* Images */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },

  /* Performance */
  swcMinify: true,

  /* Experimental Features */
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroui/react'],
  },

  /* Environment Variables */
  env: {
    NEXT_PUBLIC_APP_NAME: 'Talixa HRIS',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

export default nextConfig;
