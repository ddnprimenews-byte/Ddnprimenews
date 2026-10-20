import type { Metadata, ResolvingMetadata } from 'next';
import { INITIAL_ARTICLES } from '@/src/data/newsData';
import { NewsService } from '@/src/lib/dbService';
import { SITE_CONFIG, getArticleUrl } from '@/src/config/site';
import DDNNewsPortal from '@/src/components/DDNNewsPortal';

interface NewsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Next.js 16 Dynamic Server-Side Metadata Generator
 * Generates accurate Open Graph, Twitter Cards, and WhatsApp thumbnail sharing tags
 * Supports both article slug and unique article ID query
 */
export async function generateMetadata(
  { params }: NewsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  // Find article by slug or id (fetching from live database layer with fallback to static dataset)
  let article = null;
  try {
    article = await NewsService.getArticleBySlug(slug);
  } catch (err) {
    article = null;
  }

  if (!article) {
    article = INITIAL_ARTICLES.find((a) => a.slug === slug || a.id === slug) || null;
  }

  if (!article) {
    return {
      title: `समाचार उपलब्ध नहीं है | ${SITE_CONFIG.name}`,
      description: 'यह समाचार लेख हटा दिया गया है अथवा इसका लिंक परिवर्तित हो गया है।',
      robots: { index: false, follow: true },
    };
  }

  const articleUrl = getArticleUrl(article.slug || slug);
  const rawImageUrl = article.imageUrl || '/src/assets/images/ddn_hero_news_1792323529100.jpg';
  const absoluteImageUrl = rawImageUrl.startsWith('http')
    ? rawImageUrl
    : `${SITE_CONFIG.productionDomain}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;

  const publishedTime = article.datePublished || new Date().toISOString();
  const modifiedTime = article.dateModified || publishedTime;

  return {
    title: `${article.title} | ${SITE_CONFIG.name}`,
    description: article.summary,
    keywords: [...(article.tags || []), article.categoryHindi, 'DDN Prime News', 'दरभंगा डिजिटल नेटवर्क', 'बिहार समाचार'],
    authors: [{ name: article.author }],
    publisher: SITE_CONFIG.organization,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'hi_IN',
      url: articleUrl,
      siteName: SITE_CONFIG.name,
      title: article.title,
      description: article.summary,
      publishedTime,
      modifiedTime,
      section: article.categoryHindi,
      tags: article.tags,
      authors: [article.author],
      images: [
        {
          url: absoluteImageUrl,
          secureUrl: absoluteImageUrl,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: [absoluteImageUrl],
      creator: '@ddnprimenews',
      site: '@ddnprimenews',
    },
    other: {
      // WhatsApp and Open Graph extended metadata specifications
      'article:published_time': publishedTime,
      'article:modified_time': modifiedTime,
      'article:section': article.categoryHindi,
      'article:author': article.author,
      'og:image:secure_url': absoluteImageUrl,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/jpeg',
      'og:image:alt': article.title,
    },
  };
}

/**
 * Server Component rendering DDNNewsPortal client component with schema.org NewsArticle injection
 */
export default async function NewsSlugPage({ params }: NewsPageProps) {
  const { slug } = await params;
  
  let article = null;
  try {
    article = await NewsService.getArticleBySlug(slug);
  } catch (err) {
    article = null;
  }

  if (!article) {
    article = INITIAL_ARTICLES.find((a) => a.slug === slug || a.id === slug) || null;
  }

  const rawImageUrl = article?.imageUrl || '/src/assets/images/ddn_hero_news_1792323529100.jpg';
  const absoluteImageUrl = rawImageUrl.startsWith('http')
    ? rawImageUrl
    : `${SITE_CONFIG.productionDomain}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;

  // Generate Schema.org JSON-LD NewsArticle structured data for search engine rich results
  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.summary,
        articleBody: Array.isArray(article.content) ? article.content.join(' ') : article.summary,
        image: [absoluteImageUrl],
        datePublished: article.datePublished || new Date().toISOString(),
        dateModified: article.dateModified || article.datePublished || new Date().toISOString(),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': getArticleUrl(article.slug || slug),
        },
        author: {
          '@type': 'Person',
          name: article.author,
          jobTitle: article.authorRole || 'संवाददाता',
        },
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: SITE_CONFIG.organization,
          url: SITE_CONFIG.productionDomain,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_CONFIG.productionDomain}/icon.png`,
          },
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DDNNewsPortal initialView="article" initialArticleSlug={slug} />
    </>
  );
}
