import { MetadataRoute } from 'next';

/**
 * Generate robots.txt for search engine crawlers
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://talixa.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/pricing',
          '/solutions',
          '/about',
          '/resources',
          '/legal',
        ],
        disallow: [
          '/hr/*',           // Platform pages (require auth)
          '/admin/*',        // Admin CMS pages
          '/api/*',          // API endpoints
          '/_next/*',        // Next.js internals
          '/api/auth/*',     // Auth endpoints
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],     // Block OpenAI crawler
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],     // Block ChatGPT user agent
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],     // Block Common Crawl
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],     // Block Anthropic AI
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],     // Block Claude
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
