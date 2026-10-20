import type { MetadataRoute } from 'next';
import { INITIAL_ARTICLES } from '@/src/data/newsData';
import { NewsService } from '@/src/lib/dbService';
import { SITE_CONFIG } from '@/src/config/site';

/**
 * Dynamic Next.js 16 Sitemap Generator for DDN Prime News
 * Automatically indexes core static pages, MSME/AdSense legal disclosures,
 * and dynamic news articles sourced from the database layer with fallback.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.productionDomain;
  const now = new Date();

  // Core Static & Policy Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/editorial`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/corrections`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic News Articles from Database Layer
  let articles = [];
  try {
    articles = await NewsService.getArticles({ limit: 100 });
  } catch (err) {
    console.warn('Sitemap dynamic articles fallback:', err);
    articles = INITIAL_ARTICLES;
  }

  if (!articles || articles.length === 0) {
    articles = INITIAL_ARTICLES;
  }

  const newsRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/news/${article.slug || article.id}`,
    lastModified: new Date(article.dateModified || article.datePublished || now),
    changeFrequency: 'daily',
    priority: article.isLead ? 0.9 : 0.8,
  }));

  return [...staticRoutes, ...newsRoutes];
}
