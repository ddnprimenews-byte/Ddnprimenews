import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/src/lib/dbService';
import { articlePublishSchema } from '@/src/lib/validations';
import { NewsCategory } from '@/src/types/news';

/**
 * GET /api/news
 * Query news articles with category filtering, full-text search, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') || 'all') as NewsCategory | 'all';
    const search = searchParams.get('q') || searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const slug = searchParams.get('slug');

    if (slug) {
      const article = await NewsService.getArticleBySlug(slug);
      if (!article) {
        return NextResponse.json({ error: 'समाचार लेख नहीं मिला।' }, { status: 404 });
      }
      return NextResponse.json(article, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      });
    }

    const articles = await NewsService.getArticles({
      category,
      search,
      status: 'published',
      limit,
    });

    return NextResponse.json(
      {
        total: articles.length,
        category,
        articles,
      },
      {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'समाचार प्राप्त करने में त्रुटि: ' + (error?.message || 'अज्ञात त्रुटि') },
      { status: 500 }
    );
  }
}

/**
 * POST /api/news
 * Publish or draft news article with strict server-side Zod validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Strict Zod Validation
    const validationResult = articlePublishSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'मान्य डेटा दर्ज नहीं किया गया।',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const articleId = `art-${Date.now()}`;
    const slug =
      validatedData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || `news-${articleId}`;

    const newArticle = {
      id: articleId,
      slug,
      title: validatedData.title,
      subtitle: validatedData.subtitle || validatedData.summary,
      summary: validatedData.summary,
      aeoSummary: validatedData.summary,
      content: [validatedData.content],
      category: validatedData.category,
      categoryHindi:
        validatedData.category === 'bihar'
          ? 'बिहार विशेष'
          : validatedData.category === 'national'
          ? 'देश'
          : validatedData.category === 'politics'
          ? 'राजनीति'
          : validatedData.category === 'crime'
          ? 'अपराध'
          : validatedData.category === 'sports'
          ? 'खेल'
          : validatedData.category === 'entertainment'
          ? 'मनोरंजन एवं सिनेमा'
          : 'शिक्षा & हेल्थ',
      location: validatedData.location,
      author: validatedData.author,
      authorRole: validatedData.authorRole || 'विशेष संवाददाता',
      publishedAt: 'अभी-अभी',
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      readTime: '2 मिनट',
      imageUrl: '/images/ddn_hero_news.jpg',
      status: validatedData.status,
      views: 0,
      tags: ['डीडीएन प्राइम न्यूज', validatedData.location],
    };

    const savedId = await NewsService.saveArticle(newArticle as any);

    return NextResponse.json(
      {
        success: true,
        message: 'समाचार सफलतापूर्वक सुरक्षित किया गया।',
        articleId: savedId,
        slug,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'समाचार प्रकाशित करने में विफलता: ' + (error?.message || 'अज्ञात त्रुटि') },
      { status: 500 }
    );
  }
}
