'use client';

import React, { useState, useEffect } from 'react';
import { Article } from '../types/news';
import { SITE_CONFIG, getArticleUrl, getCanonicalUrl } from '../config/site';
import { AdSenseBanner } from './AdSenseBanner';
import { 
  ArrowLeft, Volume2, VolumeX, Share2, Bookmark, 
  BookmarkCheck, Printer, Clock, Eye, Check, Flame, 
  History, Calendar, HelpCircle, ThumbsUp, Heart, ChevronRight,
  Sparkles, Loader2
} from 'lucide-react';

interface ArticleExpressDetailProps {
  article: Article;
  allArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onBack: () => void;
  onSelectCategory: (category: any) => void;
}

export const ArticleExpressDetail: React.FC<ArticleExpressDetailProps> = ({
  article,
  allArticles,
  onSelectArticle,
  onBack,
  onSelectCategory,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingFontSize, setReadingFontSize] = useState<'base' | 'lg' | 'xl'>('base');
  const [reactions, setReactions] = useState({ satya: 64, vichar: 23, sarthak: 41 });
  const [userVoted, setUserVoted] = useState<string | null>(null);

  // AI-assisted News Summarization State
  const [aiSummaryData, setAiSummaryData] = useState<{
    summary?: string;
    bulletPoints?: string[];
    keyTakeaway?: string;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Today's Trending: Articles sorted by views or trendingRank (for Column B)
  const todaysTrending = React.useMemo(() => {
    return allArticles
      .filter((a) => a.id !== article.id && a.status === 'published')
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [allArticles, article.id]);

  // Previous Trending / Archive: Articles from 2-4 days ago or archive marked (for Column C)
  const previousTrending = React.useMemo(() => {
    return allArticles
      .filter((a) => a.id !== article.id && (a.isArchiveTrending || (a.archiveDaysAgo && a.archiveDaysAgo >= 2)))
      .slice(0, 5);
  }, [allArticles, article.id]);

  useEffect(() => {
    // Reset AI summary state on article change
    setAiSummaryData(null);
    setAiError(null);

    // Check bookmark status
    const saved = localStorage.getItem(`ddn_bookmark_${article.id}`);
    setIsBookmarked(!!saved);

    // Cancel audio if running
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Inject dynamic canonical and structured data
    const canonicalLink = document.querySelector("link[rel='canonical']") || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', getArticleUrl(article.slug));
    if (!document.head.contains(canonicalLink)) {
      document.head.appendChild(canonicalLink);
    }

    // Page title for SEO
    document.title = `${article.title} | ${SITE_CONFIG.name}`;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article]);

  const handleGenerateAiSummary = async () => {
    if (aiSummaryData) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          subtitle: article.subtitle,
          summary: article.summary,
          content: article.content,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI सारांश प्राप्त करने में समस्या');
      }
      setAiSummaryData(data);
    } catch (err: any) {
      console.warn('AI summary fetch notice:', err);
      setAiSummaryData({
        summary: article.summary,
        bulletPoints: [
          article.title,
          article.subtitle || article.summary,
          `${article.location} से ${article.author} द्वारा सत्यापित कवरेज।`,
        ],
        keyTakeaway: article.aeoSummary || 'सच्ची और निष्पक्ष पत्रकारिता के अंतर्गत महत्वपूर्ण घटनाक्रम।',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleBookmark = () => {
    if (isBookmarked) {
      localStorage.removeItem(`ddn_bookmark_${article.id}`);
      setIsBookmarked(false);
    } else {
      localStorage.setItem(`ddn_bookmark_${article.id}`, JSON.stringify(article));
      setIsBookmarked(true);
    }
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('आपके डिवाइस में ऑडियो उपलब्ध नहीं है।');
      return;
    }
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const fullText = `${article.title}। ${article.subtitle || article.summary}। ${article.content.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*${article.title}*\n\n${article.summary}\n\nडीडीएन प्राइम न्यूज पर पूरी खबर पढ़ें:\n${getArticleUrl(article.slug)}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getArticleUrl(article.slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = (type: 'satya' | 'vichar' | 'sarthak') => {
    if (userVoted === type) return;
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setUserVoted(type);
  };

  // Structured Data Schema for NewsArticle
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': getArticleUrl(article.slug),
    },
    'headline': article.title,
    'description': article.summary,
    'image': [
      article.imageUrl.startsWith('http')
        ? article.imageUrl
        : `${SITE_CONFIG.productionDomain}${article.imageUrl}`,
    ],
    'datePublished': article.datePublished,
    'dateModified': article.dateModified || article.datePublished,
    'author': {
      '@type': 'Person',
      'name': article.author,
      'jobTitle': article.authorRole,
    },
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': SITE_CONFIG.name,
      'url': SITE_CONFIG.productionDomain,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_CONFIG.productionDomain}/images/ddn_hero_news.jpg`,
      },
    },
    'articleSection': article.categoryHindi,
    'inLanguage': 'hi',
  };

  return (
    <div className="w-full bg-stone-100 min-h-screen py-6">
      {/* Dynamic JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumbs Bar */}
        <div className="bg-white px-4 py-2.5 rounded-lg border border-stone-200 shadow-2xs mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav className="flex items-center space-x-1.5 text-stone-500 overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
            <button
              onClick={onBack}
              className="text-stone-700 hover:text-red-700 font-semibold transition"
            >
              होम
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <button
              onClick={() => onSelectCategory(article.category)}
              className="text-stone-700 hover:text-red-700 font-semibold transition"
            >
              {article.categoryHindi}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="text-stone-400 truncate max-w-[220px] sm:max-w-md">
              {article.title}
            </span>
          </nav>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Audio Read aloud */}
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
                isPlayingAudio
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
              <span>{isPlayingAudio ? 'रोकें' : 'खबर सुनें'}</span>
            </button>

            {/* Font scale switcher */}
            <div className="hidden sm:flex items-center bg-stone-100 rounded px-1.5 py-0.5 border border-stone-200">
              <button
                onClick={() => setReadingFontSize('base')}
                className={`px-1 font-semibold ${readingFontSize === 'base' ? 'text-red-700 font-bold' : 'text-stone-500'}`}
              >
                अ
              </button>
              <button
                onClick={() => setReadingFontSize('lg')}
                className={`px-1 font-semibold ${readingFontSize === 'lg' ? 'text-red-700 font-bold' : 'text-stone-500'}`}
              >
                अ+
              </button>
              <button
                onClick={() => setReadingFontSize('xl')}
                className={`px-1 font-semibold ${readingFontSize === 'xl' ? 'text-red-700 font-bold' : 'text-stone-500'}`}
              >
                अ++
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={toggleBookmark}
              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition"
              title="सुरक्षित करें"
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-red-600" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition hidden sm:inline-block"
              title="प्रिंट करें"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Header Leaderboard AdSense Slot */}
        <AdSenseBanner slot="header-leaderboard" />

        {/* MANDATORY ARTICLE EXPRESS LAYOUT: Strictly 60% / 25% / 15% (Desktop CSS Grid: 12 / 5 / 3 of 20 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-20 gap-6 items-start">
          
          {/* ========================================================================= */}
          {/* COLUMN A (60%): Main Article Content (12 of 20 cols)                      */}
          {/* ========================================================================= */}
          <main className="lg:col-span-12 bg-white rounded-xl border border-stone-200 p-5 sm:p-8 shadow-xs">
            {/* Category Kicker & Timestamps */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-3 pb-3 border-b border-stone-100">
              <span className="font-bold text-red-700 uppercase tracking-wider">
                {article.categoryHindi}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="font-medium text-stone-700">{article.location}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              
              <time dateTime={article.datePublished} className="font-medium">
                प्रकाशित: {article.publishedAt}
              </time>
              
              {article.dateModified && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="text-stone-400">
                    अपडेट: {new Date(article.dateModified).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              )}

              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1 font-mono text-[11px] tabular-nums text-stone-500">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                {article.views.toLocaleString('hi-IN')} पाठक
              </span>
            </div>

            {/* Single H1 Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight font-serif mb-3 text-balance">
              {article.title}
            </h1>

            {/* Subheadline (Lead summary) */}
            {article.subtitle && (
              <p className="text-base sm:text-lg font-medium text-stone-700 leading-relaxed mb-5 text-stone-600">
                {article.subtitle}
              </p>
            )}

            {/* Author Byline & Credentials */}
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200 mb-6 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                  <img
                    src={article.authorAvatar || '/images/ddn_reporter_press.jpg'}
                    alt={article.author}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/ddn_reporter_press.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-sm">
                    {article.author}
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    {article.authorRole} · दरभंगा डिजिटल नेटवर्क ब्यूरो
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                  title="WhatsApp पर शेयर करें"
                >
                  <span>Share</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition"
                  title="लिंक कॉपी करें"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* AEO (Answer Engine Optimization) Direct Answer Callout */}
            {article.aeoSummary && (
              <div className="bg-amber-50/70 border-l-4 border-red-600 p-4 rounded-r-lg mb-4 text-xs sm:text-sm text-stone-800 leading-relaxed">
                <span className="font-bold text-red-900 block mb-1 uppercase tracking-wide text-[11px]">
                  📌 त्वरित सार (Executive Overview / AEO Answer):
                </span>
                {article.aeoSummary}
              </div>
            )}

            {/* AI-Assisted News Summarization Helper (Powered by @google/genai Gemini) */}
            <div className="mb-6">
              {!aiSummaryData && (
                <button
                  onClick={handleGenerateAiSummary}
                  disabled={isAiLoading}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-800 via-stone-800 to-amber-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 border border-red-700/50 shadow-xs hover:shadow-md active:scale-98 cursor-pointer disabled:opacity-60"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                      <span>डीडीएन एआई समाचार का विश्लेषण कर रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>✨ AI 30-सेकंड स्मार्ट सारांश देखें (AI Bullet Summary)</span>
                    </>
                  )}
                </button>
              )}

              {aiSummaryData && (
                <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-stone-100 p-5 rounded-xl border border-red-900/50 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>डीडीएन एआई विश्लेषक (AI Quick Insights)</span>
                    </div>
                    <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 font-mono">
                      Gemini 3.8 Flash
                    </span>
                  </div>

                  {aiSummaryData.summary && (
                    <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-hindi">
                      {aiSummaryData.summary}
                    </p>
                  )}

                  {aiSummaryData.bulletPoints && aiSummaryData.bulletPoints.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        प्रमुख 3 बिंदु (Key Highlights):
                      </span>
                      <ul className="space-y-1.5 text-xs text-stone-300">
                        {aiSummaryData.bulletPoints.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-400 font-bold shrink-0 mt-0.5">▸</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSummaryData.keyTakeaway && (
                    <div className="bg-red-950/40 border border-red-800/40 p-2.5 rounded text-xs text-amber-200">
                      <strong>निष्कर्ष:</strong> {aiSummaryData.keyTakeaway}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Featured Image with defined dimensions to eliminate CLS */}
            <figure className="mb-6 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
              <div className="relative aspect-video w-full">
                <img
                  src={article.imageUrl || '/images/ddn_hero_news.jpg'}
                  alt={article.title}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/ddn_hero_news.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-2.5 bg-stone-50 border-t border-stone-100 text-xs text-stone-600 text-center italic">
                {article.imageCaption || `चित्र: ${article.title} (कवरेज: डीडीएन प्राइम न्यूज संवाददाता)`}
              </figcaption>
            </figure>

            {/* In-Article Body Content */}
            <div
              className={`space-y-5 leading-loose text-stone-800 ${
                readingFontSize === 'base'
                  ? 'text-base'
                  : readingFontSize === 'lg'
                  ? 'text-lg'
                  : 'text-xl'
              }`}
            >
              {article.content.map((paragraph, index) => (
                <p key={index} className="text-justify first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-red-700 first-letter:mr-1">
                  {paragraph}
                </p>
              ))}

              {/* In-Article AdSense Banner Placeholder */}
              <AdSenseBanner slot="in-article" />

              {/* Structured H2/H3 Sections */}
              {article.sections && article.sections.map((sec, idx) => (
                <section key={idx} className="pt-4 border-t border-stone-200">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mb-2">
                    {sec.heading}
                  </h2>
                  <p className="text-stone-700 leading-relaxed text-justify">
                    {sec.content}
                  </p>
                </section>
              ))}
            </div>

            {/* Factual FAQs for AEO & GEO */}
            {article.faqs && article.faqs.length > 0 && (
              <section className="mt-8 pt-6 border-t border-stone-200 bg-stone-50 p-5 rounded-lg border border-stone-200">
                <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-red-600" />
                  <span>अक्सर पूछे जाने वाले प्रश्न (FAQ - AEO Factual Answers)</span>
                </h3>
                <div className="space-y-4">
                  {article.faqs.map((faq, i) => (
                    <div key={i} className="text-xs sm:text-sm">
                      <h4 className="font-bold text-stone-900 mb-1">
                        प्र. {faq.question}
                      </h4>
                      <p className="text-stone-600 leading-relaxed pl-3 border-l-2 border-red-600">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reader Reactions & Feedback */}
            <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
                  पाठक सत्यापन एवं प्रतिक्रिया:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleReaction('satya')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition ${
                      userVoted === 'satya' ? 'bg-red-50 border-red-400 text-red-800' : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-red-600" />
                    <span>सत्य व निष्पक्ष ({reactions.satya})</span>
                  </button>

                  <button
                    onClick={() => handleReaction('vichar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition ${
                      userVoted === 'vichar' ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                    }`}
                  >
                    <span>💡 विचारणीय ({reactions.vichar})</span>
                  </button>

                  <button
                    onClick={() => handleReaction('sarthak')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition ${
                      userVoted === 'sarthak' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-emerald-600" />
                    <span>सार्थक पत्रकारिता ({reactions.sarthak})</span>
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 text-xs text-stone-500">
                {article.tags.map((tag) => (
                  <span key={tag} className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </main>

          {/* ========================================================================= */}
          {/* COLUMN B (25%): Today's Trending News (5 of 20 cols)                       */}
          {/* ========================================================================= */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-xs sticky top-20">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600 animate-pulse" />
                  <h3 className="font-bold text-sm sm:text-base font-serif text-stone-900">
                    आज की ट्रेंडिंग खबरें
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-stone-400 uppercase">24H LIVE</span>
              </div>

              {/* Trending News List */}
              <div className="space-y-4">
                {todaysTrending.map((trend, idx) => (
                  <article
                    key={trend.id}
                    onClick={() => onSelectArticle(trend)}
                    className="group cursor-pointer pb-3 border-b border-stone-100 last:border-0 last:pb-0"
                  >
                    <div className="flex gap-3">
                      {/* Number Rank */}
                      <span className="font-serif font-black text-2xl text-stone-300 group-hover:text-red-600 transition shrink-0 w-5">
                        {idx + 1}
                      </span>

                      <div className="flex-grow space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                          <span className="text-red-700 font-bold">{trend.categoryHindi}</span>
                          <span aria-hidden="true">·</span>
                          <span>{trend.publishedAt}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-red-700 transition leading-snug line-clamp-2">
                          {trend.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                          <span>{trend.views.toLocaleString('hi-IN')} व्यूज</span>
                        </div>
                      </div>

                      {/* Small Thumbnail */}
                      <div className="w-16 h-14 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <img
                          src={trend.imageUrl || '/images/ddn_hero_news.jpg'}
                          alt={trend.title}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/ddn_hero_news.jpg';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* In-Sidebar Display AdSense Banner */}
              <AdSenseBanner slot="sidebar-display" />
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* COLUMN C (15%): Previous Trending / Archive News (3 of 20 cols)            */}
          {/* ========================================================================= */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs sticky top-20">
              <div className="flex items-center gap-1.5 pb-2.5 mb-3 border-b border-stone-200">
                <History className="w-4 h-4 text-amber-700 shrink-0" />
                <h3 className="font-bold text-xs font-serif text-stone-900 uppercase tracking-tight">
                  पिछले दिनों की चर्चा
                </h3>
              </div>

              <div className="space-y-3">
                {previousTrending.map((arch) => (
                  <article
                    key={arch.id}
                    onClick={() => onSelectArticle(arch)}
                    className="group cursor-pointer pb-2.5 border-b border-stone-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-1 text-[10px] text-amber-800 font-medium mb-0.5">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>{arch.archiveDaysAgo ? `${arch.archiveDaysAgo} दिन पूर्व` : 'आर्काइव'}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-stone-800 group-hover:text-red-700 transition leading-snug line-clamp-3">
                      {arch.title}
                    </h4>
                  </article>
                ))}
              </div>

              {/* Archive Portal Button */}
              <div className="mt-4 pt-3 border-t border-stone-100 text-center">
                <button
                  onClick={() => onSelectCategory('bihar')}
                  className="text-[11px] text-red-700 hover:text-red-900 font-bold hover:underline"
                >
                  सम्पूर्ण आर्काइव देखें →
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};
