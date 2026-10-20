import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/src/config/site';

/**
 * Next.js 16 Robots.txt Generator for DDN Prime News
 * Authorizes Googlebot, Googlebot-News, and Bingbot for full news indexing
 * while safeguarding private API endpoints and build assets.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.productionDomain;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'bingbot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
