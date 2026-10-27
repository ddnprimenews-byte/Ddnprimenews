'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Article, NewsCategory, WeatherData, LegalPageType } from '../types/news';
import { INITIAL_ARTICLES, BREAKING_NEWS_ITEMS, INITIAL_WEATHER, VIDEO_BULLETINS } from '../data/newsData';
import { SITE_CONFIG, getCanonicalUrl } from '../config/site';

import { TopBar } from './TopBar';
import { Header } from './Header';
import { Navbar } from './Navbar';
import { BreakingTicker } from './BreakingTicker';
import { HeroLead } from './HeroLead';
import { NewsCard } from './NewsCard';
import { ArticleExpressDetail } from './ArticleExpressDetail';
import { LegalPages } from './LegalPages';
import { AdSenseBanner } from './AdSenseBanner';
import { ReporterApplicationModal } from './ReporterApplicationModal';
import { EPaperModal } from './EPaperModal';
import { VideoModal } from './VideoModal';
import { TeamSection } from './TeamSection';
import { HealthEducationSection } from './HealthEducationSection';
import { AdminEditorModal } from './AdminEditorModal';
import { ReporterDeskModal } from './ReporterDeskModal';
import { Footer } from './Footer';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsletterSchema, NewsletterInput } from '../lib/validations';

import { 
  CloudSun, Newspaper, ShieldCheck, Mail, CheckCircle2, 
  Play, Radio, UserPlus, Phone, Flame, ArrowRight, TrendingUp,
  LayoutGrid, Smartphone, Sparkles, Volume2, Share2 
} from 'lucide-react';

export interface DDNNewsPortalProps {
  initialView?: 'home' | 'article' | 'legal';
  initialLegalPage?: LegalPageType;
  initialArticleSlug?: string;
}

export default function App({
  initialView = 'home',
  initialLegalPage = 'privacy',
  initialArticleSlug,
}: DDNNewsPortalProps = {}) {
  const [currentDate, setCurrentDate] = useState('');
  
  // Initialize with initial news dataset for instant SSR/rendering, updated dynamically by Firestore
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [breakingNews, setBreakingNews] = useState<string[]>(BREAKING_NEWS_ITEMS);
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);

  const [weatherList] = useState<WeatherData[]>(INITIAL_WEATHER);
  const [selectedCity, setSelectedCity] = useState('Darbhanga');
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Non-sensitive client preference: Font sizing
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ddn_pref_font_size') as any) || 'normal';
    }
    return 'normal';
  });

  // View format: standard desktop grid vs mobile shorts/reels view
  const [readerMode, setReaderMode] = useState<'grid' | 'shorts'>('grid');

  // Navigation State
  const [activeView, setActiveView] = useState<'home' | 'article' | 'legal'>(initialView);
  const [activeArticle, setActiveArticle] = useState<Article | null>(() => {
    if (initialArticleSlug) {
      return INITIAL_ARTICLES.find((a) => a.slug === initialArticleSlug || a.id === initialArticleSlug) || null;
    }
    return null;
  });
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageType>(initialLegalPage);

  // Modals
  const [isReporterModalOpen, setIsReporterModalOpen] = useState(false);
  const [isReporterLoginOpen, setIsReporterLoginOpen] = useState(false);
  const [isEPaperModalOpen, setIsEPaperModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAdminDeskOpen, setIsAdminDeskOpen] = useState(false);

  // Newsletter subscription state
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Real-time Firestore sync & connection test
  useEffect(() => {
    let unsubscribeArticles: (() => void) | undefined;
    let unsubscribeBreaking: (() => void) | undefined;

    import('../lib/firebase').then(({ testConnection, subscribeToArticles, subscribeToBreakingNews }) => {
      testConnection();

      // Subscribe to real-time Firestore articles (authoritative source of truth)
      try {
        unsubscribeArticles = subscribeToArticles(
          (firestoreArticles) => {
            setIsArticlesLoading(false);
            if (firestoreArticles && firestoreArticles.length > 0) {
              // Firestore is the sole source of truth for persistent articles
              setArticles(firestoreArticles);
            }
          },
          (err) => {
            console.warn('Realtime articles listener note:', err);
            setIsArticlesLoading(false);
          }
        );
      } catch (e) {
        console.warn('Realtime articles listener init note:', e);
        setIsArticlesLoading(false);
      }

      // Subscribe to real-time Firestore breaking news
      try {
        unsubscribeBreaking = subscribeToBreakingNews(
          (breakingList) => {
            if (breakingList && breakingList.length > 0) {
              setBreakingNews(breakingList);
            }
          },
          (err) => {
            console.warn('Realtime breaking listener note:', err);
          }
        );
      } catch (e) {
        console.warn('Realtime breaking listener init note:', e);
      }
    });

    return () => {
      unsubscribeArticles?.();
      unsubscribeBreaking?.();
    };
  }, []);

  // Synchronize URL on mount and handle routing
  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(new Date().toLocaleDateString('hi-IN', options));

    // Handle initial route from hash or pathname
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;

      if (hash.startsWith('#/news/') || pathname.startsWith('/news/')) {
        const slug = hash.startsWith('#/news/') 
          ? hash.replace('#/news/', '') 
          : pathname.replace('/news/', '');
        const matched = articles.find((a) => a.slug === slug || a.id === slug) || INITIAL_ARTICLES.find((a) => a.slug === slug || a.id === slug);
        if (matched) {
          setActiveArticle(matched);
          setActiveView('article');
          return;
        }
      }

      if (
        hash.startsWith('#/policy/') ||
        pathname.startsWith('/privacy') ||
        pathname.startsWith('/terms') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/contact') ||
        pathname.startsWith('/editorial') ||
        pathname.startsWith('/corrections')
      ) {
        let page: LegalPageType = 'privacy';
        if (pathname.includes('terms') || hash.includes('terms')) page = 'terms';
        else if (pathname.includes('about') || hash.includes('about')) page = 'about';
        else if (pathname.includes('contact') || hash.includes('contact')) page = 'contact';
        else if (pathname.includes('editorial') || hash.includes('editorial')) page = 'editorial';
        else if (pathname.includes('corrections') || hash.includes('corrections')) page = 'corrections';
        else page = (hash.replace('#/policy/', '') || 'privacy') as LegalPageType;

        setActiveLegalPage(page);
        setActiveView('legal');
        setActiveArticle(null);
        return;
      }

      // Check category in URL params (?category=...)
      if (pathname === '/' || pathname === '/portal') {
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('category') as NewsCategory;
        if (catParam) {
          setActiveCategory(catParam);
          setActiveView('home');
        }
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [articles]);

  const handleCycleFontSize = () => {
    setFontSize((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  // Select Article & update route
  const handleSelectArticle = (art: Article) => {
    setActiveArticle(art);
    setActiveView('article');
    try {
      window.history.pushState(null, '', `/news/${art.slug}`);
    } catch (e) {
      window.location.hash = `#/news/${art.slug}`;
    }
    window.scrollTo(0, 0);
  };

  // Back to Homepage
  const handleBackToHome = () => {
    setActiveView('home');
    setActiveArticle(null);
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {
      window.location.hash = '';
    }
    document.title = `${SITE_CONFIG.name} | ${SITE_CONFIG.organization}`;
    window.scrollTo(0, 0);
  };

  // Select Legal Policy Page (Instant scroll to top so content is immediately visible)
  const handleSelectLegalPage = (page: LegalPageType) => {
    setActiveLegalPage(page);
    setActiveView('legal');
    setActiveArticle(null);
    try {
      window.history.pushState(null, '', `/${page}`);
    } catch (e) {
      window.location.hash = `#/policy/${page}`;
    }
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 10);
  };

  // Select Category with instant visual feedback and smooth scroll to news
  const handleSelectCategory = (cat: NewsCategory) => {
    setActiveCategory(cat);
    setActiveView('home');
    setActiveArticle(null);
    setSearchQuery('');
    try {
      window.history.pushState(null, '', cat === 'all' ? '/' : `/?category=${cat}`);
    } catch (e) {
      window.location.hash = cat === 'all' ? '' : `#/category/${cat}`;
    }
    const target = document.getElementById('news-main-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Add Article (Draft or Published) - 100% Firebase Firestore authoritatively
  const handleAddArticle = (newArt: Article) => {
    setArticles((prev) => [newArt, ...prev]);
  };

  // Delete Article - 100% Firebase Firestore
  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Add Breaking News - 100% Firebase Firestore
  const handleAddBreaking = (text: string) => {
    setBreakingNews((prev) => [text, ...prev]);
  };

  // Global Audio Reader
  const handleListenArticle = (art: Article) => {
    if (!('speechSynthesis' in window)) {
      alert('ऑडियो सहायता उपलब्ध नहीं है।');
      return;
    }
    window.speechSynthesis.cancel();
    const text = `${art.title}। ${art.summary}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const {
    register: registerNewsletter,
    handleSubmit: handleNewsletterSubmit,
    formState: { errors: newsletterErrors, isSubmitting: isNewsletterSubmitting },
    reset: resetNewsletterForm,
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  // Newsletter submission with Zod validation & modular API call
  const onNewsletterSubmit = async (data: NewsletterInput) => {
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setNewsletterSubscribed(true);
      resetNewsletterForm();
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    } catch (e) {
      setNewsletterSubscribed(true);
      resetNewsletterForm();
    }
  };

  // Only published articles appear publicly
  const publishedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'published');
  }, [articles]);

  // Filtered Articles based on Category & Search
  const filteredArticles = useMemo(() => {
    let result = publishedArticles;

    if (activeCategory !== 'all' && activeCategory !== 'team') {
      result = result.filter((a) => a.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [publishedArticles, activeCategory, searchQuery]);

  const leadArticle = useMemo(() => {
    return filteredArticles.find((a) => a.isLead) || filteredArticles[0] || publishedArticles[0];
  }, [filteredArticles, publishedArticles]);

  const regularArticles = useMemo(() => {
    return filteredArticles.filter((a) => a.id !== leadArticle?.id);
  }, [filteredArticles, leadArticle]);

  // Shared Trending Data for homepage & sidebar
  const trendingArticles = useMemo(() => {
    return [...publishedArticles]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [publishedArticles]);

  const activeWeatherData = weatherList.find((w) => w.city === selectedCity) || weatherList[1];

  return (
    <div
      className={`min-h-screen flex flex-col bg-stone-100 text-stone-900 overflow-x-hidden ${
        fontSize === 'large' ? 'text-[17px]' : fontSize === 'xlarge' ? 'text-[19px]' : 'text-base'
      }`}
    >
      {/* 1. LOGO & HEADER (CENTERED BRAND STRIP + MAROON NAVIGATION BAR) */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (activeView !== 'home') setActiveView('home');
        }}
        onOpenEPaper={() => setIsEPaperModalOpen(true)}
        onOpenLiveVideo={() => setIsVideoModalOpen(true)}
        onOpenAdminDesk={() => setIsAdminDeskOpen(true)}
        onBackToHome={handleBackToHome}
        onSelectCategory={handleSelectCategory}
      />

      {/* 4. BREAKING NEWS TICKER */}
      <BreakingTicker
        items={breakingNews}
        onSelectBreakingItem={(text) => {
          const match = publishedArticles.find((a) => a.title.includes(text.slice(0, 20)));
          if (match) handleSelectArticle(match);
        }}
      />

      {/* VIEW 1: ARTICLE EXPRESS DETAIL (Mandatory 60% / 25% / 15% Desktop Grid) */}
      {activeView === 'article' && activeArticle ? (
        <ArticleExpressDetail
          article={activeArticle}
          allArticles={publishedArticles}
          onSelectArticle={handleSelectArticle}
          onBack={handleBackToHome}
          onSelectCategory={handleSelectCategory}
        />
      ) : activeView === 'legal' ? (
        /* VIEW 2: LEGAL & ADSENSE COMPLIANCE POLICIES */
        <LegalPages
          pageType={activeLegalPage}
          onSelectPage={setActiveLegalPage}
          onBackToHome={handleBackToHome}
        />
      ) : (
        /* VIEW 3: HOMEPAGE & CATEGORY ARCHIVES */
        <main id="news-main-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-grow w-full scroll-mt-28">
          {activeCategory === 'team' ? (
            <TeamSection />
          ) : activeCategory === 'education-health' ? (
            <HealthEducationSection
              articles={publishedArticles}
              onSelectArticle={handleSelectArticle}
            />
          ) : (
            <div className="space-y-6">
              {/* Header Leaderboard AdSense Slot on Homepage */}
              <AdSenseBanner slot="header-leaderboard" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Content Column (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Category Filter Title if active */}
                  {activeCategory !== 'all' && (
                    <div className="flex items-center justify-between pb-2 border-b-2 border-red-700">
                      <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                        {activeCategory === 'bihar'
                          ? 'बिहार विशेष समाचार'
                          : activeCategory === 'national'
                          ? 'राष्ट्रीय खबरें'
                          : activeCategory === 'politics'
                          ? 'राजनीति व चुनाव'
                          : activeCategory === 'crime'
                          ? 'अपराध व कानून व्यवस्था'
                          : activeCategory === 'sports'
                          ? 'खेल जगत'
                          : activeCategory === 'entertainment'
                          ? 'मनोरंजन एवं सिनेमा'
                          : 'विशेष समाचार'}
                      </h2>
                      <button
                        onClick={() => handleSelectCategory('all')}
                        className="text-xs text-red-700 hover:underline font-semibold"
                      >
                        सभी समाचार देखें
                      </button>
                    </div>
                  )}

                  {/* Search Status */}
                  {searchQuery && (
                    <div className="bg-amber-50 p-3 rounded border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                      <span>
                        खोज परिणाम: <strong>"{searchQuery}"</strong> ({filteredArticles.length} समाचार मिले)
                      </span>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-red-700 font-bold hover:underline"
                      >
                        खोज रद्द करें
                      </button>
                    </div>
                  )}

                  {/* 1. Hero Lead Section */}
                  {!searchQuery && activeCategory === 'all' && leadArticle && (
                    <HeroLead
                      leadArticle={leadArticle}
                      sideArticles={regularArticles}
                      onSelectArticle={handleSelectArticle}
                      onListenArticle={handleListenArticle}
                    />
                  )}

                  {/* News Articles Grid & View Switcher */}
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-4 border-b border-stone-200">
                      <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-red-600" />
                        {searchQuery
                          ? 'सर्च परिणाम'
                          : activeCategory === 'all'
                          ? 'प्रमुख खबरें (Top Stories)'
                          : 'श्रेणी समाचार'}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="inline-flex rounded-lg border border-stone-300 bg-stone-100 p-0.5 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setReaderMode('grid')}
                            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                              readerMode === 'grid'
                                ? 'bg-white text-red-700 shadow-xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                            title="विस्तृत डेस्कटॉप ग्रिड"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">ग्रिड व्यू</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setReaderMode('shorts')}
                            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                              readerMode === 'shorts'
                                ? 'bg-red-700 text-white shadow-xs'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                            title="मोबाइल रील्स व शॉर्ट्स कार्ड्स"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>शॉर्ट्स / रील्स</span>
                          </button>
                        </div>
                        <span className="text-xs text-stone-500 font-mono hidden md:inline">
                          कुल: {filteredArticles.length}
                        </span>
                      </div>
                    </div>

                    {filteredArticles.length === 0 ? (
                      <div className="bg-white p-8 rounded-lg border border-stone-200 text-center space-y-2">
                        <p className="font-bold text-stone-800">कोई समाचार नहीं मिला।</p>
                        <p className="text-xs text-stone-500">
                          कृपया दूसरा खोज शब्द दर्ज करें अथवा 'सभी खबरें' श्रेणी चुनें।
                        </p>
                      </div>
                    ) : readerMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {regularArticles.map((art) => (
                          <NewsCard
                            key={art.id}
                            article={art}
                            onSelect={handleSelectArticle}
                            onListen={handleListenArticle}
                          />
                        ))}
                      </div>
                    ) : (
                      /* Mobile Short-form / Reels View */
                      <div className="space-y-5">
                        {regularArticles.map((art) => (
                          <article
                            key={art.id}
                            className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition"
                          >
                            <div className="relative aspect-video w-full bg-stone-900 overflow-hidden">
                              <img
                                src={art.imageUrl}
                                alt={art.title}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/ddn_hero_news.jpg';
                                }}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                <span className="bg-red-700 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                                  {art.categoryHindi}
                                </span>
                                <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                                  {art.location}
                                </span>
                              </div>
                              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-amber-300 text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>30s क्विक रीड</span>
                              </div>
                            </div>

                            <div className="p-4 sm:p-5 space-y-3">
                              <h3 
                                onClick={() => handleSelectArticle(art)}
                                className="text-base sm:text-lg font-bold font-serif text-stone-900 hover:text-red-700 transition cursor-pointer leading-snug"
                              >
                                {art.title}
                              </h3>

                              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                                {art.summary}
                              </p>

                              {art.aeoSummary && (
                                <div className="text-xs text-stone-700 flex items-start gap-1.5">
                                  <span className="font-bold text-red-700 shrink-0">निष्कर्ष:</span>
                                  <span className="line-clamp-2">{art.aeoSummary}</span>
                                </div>
                              )}

                              <div className="pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                                <span className="text-stone-500 font-mono text-[11px]">
                                  {art.publishedAt} · {art.author}
                                </span>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleListenArticle(art)}
                                    className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-red-700 hover:bg-stone-50 transition flex items-center gap-1 cursor-pointer"
                                    title="ऑडियो सुनें"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-[11px]">सुनें</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      const text = encodeURIComponent(`*${art.title}*\n\nडीडीएन प्राइम न्यूज पर पढ़ें:\n${typeof window !== 'undefined' ? window.location.origin : ''}/news/${art.slug}`);
                                      if (typeof window !== 'undefined') {
                                        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                                      }
                                    }}
                                    className="p-1.5 rounded-lg border border-stone-200 text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-1 cursor-pointer"
                                    title="व्हाट्सएप शेयर"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-[11px]">शेयर</span>
                                  </button>
                                  <button
                                    onClick={() => handleSelectArticle(art)}
                                    className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold transition flex items-center gap-1 text-[11px] cursor-pointer"
                                  >
                                    <span>पूरी खबर</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 16:9 Video Bulletin Section */}
                  <div className="bg-stone-950 text-white rounded-lg p-5 border border-stone-800 shadow-md">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
                      <div className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                        <h3 className="text-lg font-bold font-serif">16:9 प्राइम डिजिटल वीडियो बुलेटिन्स</h3>
                      </div>
                      <span className="text-[11px] font-mono text-red-400 bg-red-950/70 border border-red-800 px-2 py-0.5 rounded">
                        HD LIVE STREAM
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-8">
                        <div 
                          onClick={() => setIsVideoModalOpen(true)}
                          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group bg-stone-900 border border-stone-800"
                        >
                          <img
                            src={VIDEO_BULLETINS[0].thumbnail}
                            alt={VIDEO_BULLETINS[0].title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/ddn_reporter_press.jpg';
                            }}
                            className="w-full h-full object-cover group-hover:scale-103 transition duration-500 opacity-85"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-between p-4">
                            <span className="self-start bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5 shadow">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              प्राइम रिपोर्टर
                            </span>
                            <div className="flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                                <Play className="w-6 h-6 ml-0.5 fill-current" />
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-yellow-400 font-mono">एंकर: {VIDEO_BULLETINS[0].anchor} · {VIDEO_BULLETINS[0].duration}</span>
                              <h4 className="text-sm sm:text-base font-bold text-white leading-snug mt-1">
                                {VIDEO_BULLETINS[0].title}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-4 flex flex-col gap-2.5">
                        <span className="text-xs text-stone-400 font-semibold mb-1">अन्य प्रमुख बुलेटिन्स</span>
                        {VIDEO_BULLETINS.slice(1, 3).map((vid) => (
                          <div
                            key={vid.id}
                            onClick={() => setIsVideoModalOpen(true)}
                            className="flex gap-2.5 p-2 bg-stone-900/80 hover:bg-stone-800 rounded-lg cursor-pointer transition border border-stone-800/80 group"
                          >
                            <div className="relative w-24 aspect-video rounded overflow-hidden shrink-0 bg-stone-800">
                              <img 
                                src={vid.thumbnail} 
                                alt={vid.title} 
                                referrerPolicy="no-referrer" 
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/ddn_bihar_heritage.jpg';
                                }}
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="w-3.5 h-3.5 text-white fill-current" />
                              </div>
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                              <h5 className="text-xs font-semibold text-stone-200 group-hover:text-red-400 transition line-clamp-2 leading-tight">
                                {vid.title}
                              </h5>
                              <span className="text-[10px] text-stone-400 mt-1">{vid.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mid-Content AdSense Banner */}
                  <AdSenseBanner slot="in-article" />

                  {/* District Spotlight: Darbhanga & Mithila */}
                  <div className="bg-white rounded-lg border border-stone-200 p-5 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
                      <div>
                        <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                          मिथिलांचल विशेष
                        </span>
                        <h3 className="text-lg font-bold font-serif text-stone-900">
                          दरभंगा, मधुबनी एवं समस्तीपुर क्षेत्रीय विकास
                        </h3>
                      </div>
                      <button
                        onClick={() => setIsReporterModalOpen(true)}
                        className="text-xs text-red-700 hover:text-red-900 font-bold flex items-center gap-1"
                      >
                        <span>अपने क्षेत्र की खबर भेजें</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-stone-50 rounded border border-stone-200">
                        <span className="font-bold text-stone-900 block mb-1">दरभंगा एम्स (AIIMS)</span>
                        <p className="text-stone-600 leading-relaxed">
                          शोभन-एकमी बाईपास फोरलेन कनेक्टिविटी का टेंडर आवंटित, निर्माण कार्य तेजी पर।
                        </p>
                      </div>

                      <div className="p-3 bg-stone-50 rounded border border-stone-200">
                        <span className="font-bold text-stone-900 block mb-1">मखाना जीआई टैग उद्योग</span>
                        <p className="text-stone-600 leading-relaxed">
                          दरभंगा-मधुबनी के मखाना उत्पादक किसानों के लिए विशेष सब्सिडी व निर्यात सहायता।
                        </p>
                      </div>

                      <div className="p-3 bg-stone-50 rounded border border-stone-200">
                        <span className="font-bold text-stone-900 block mb-1">दरभंगा एयरपोर्ट विस्तार</span>
                        <p className="text-stone-600 leading-relaxed">
                          नए टर्मिनल भवन और नाइट लैंडिंग प्रणाली (CAT-I ILS) की स्थापना का कार्य अंतिम चरण में।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar (4 cols) */}
                <aside className="lg:col-span-4 space-y-6">
                  {/* Today's Trending Box in Sidebar */}
                  <div className="bg-white p-5 rounded-lg shadow-xs border border-stone-200">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
                      <div className="flex items-center gap-1.5 text-stone-900">
                        <TrendingUp className="w-4 h-4 text-red-600" />
                        <h3 className="font-bold text-sm font-serif">
                          आज की चर्चित खबरें (Trending)
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">HOT</span>
                    </div>

                    <div className="space-y-3">
                      {trendingArticles.slice(0, 4).map((trend, idx) => (
                        <div
                          key={trend.id}
                          onClick={() => handleSelectArticle(trend)}
                          className="flex items-start gap-2.5 cursor-pointer group pb-2.5 border-b border-stone-100 last:border-0 last:pb-0"
                        >
                          <span className="font-serif font-black text-lg text-stone-300 group-hover:text-red-600 transition w-4">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-[10px] font-bold text-red-700">{trend.categoryHindi}</span>
                            <h4 className="text-xs font-semibold text-stone-900 group-hover:text-red-700 transition leading-snug line-clamp-2">
                              {trend.title}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* E-Paper & Newsletter Subscription Widget */}
                  <div className="bg-white p-5 rounded-lg shadow-xs border border-stone-200">
                    <div className="flex items-center space-x-2 text-stone-900 mb-2">
                      <Newspaper className="w-5 h-5 text-red-600 shrink-0" />
                      <h3 className="font-bold text-base font-serif">
                        ई-पेपर और न्यूज़लेटर सदस्यता
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                      अपनी ईमेल आईडी दर्ज करें और प्रतिदिन सुबह अपने इनबॉक्स में पाएं दैनिक बुलेटिन व डिजिटल ई-पेपर।
                    </p>

                    {newsletterSubscribed ? (
                      <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>सफलतापूर्वक सब्सक्राइब कर लिया गया! धन्यवाद।</span>
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit(onNewsletterSubmit)} className="space-y-2">
                        <div>
                          <input
                            type="email"
                            {...registerNewsletter('email')}
                            placeholder="अपनी ईमेल आईडी दर्ज करें..."
                            className={`w-full p-2.5 border rounded text-xs focus:outline-none bg-stone-50 focus:bg-white ${
                              newsletterErrors.email ? 'border-red-500 bg-red-50/50' : 'border-stone-300 focus:border-red-600'
                            }`}
                          />
                          {newsletterErrors.email && (
                            <p className="text-[11px] text-red-600 mt-1 font-medium">{newsletterErrors.email.message}</p>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isNewsletterSubmitting}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
                        >
                          {isNewsletterSubmitting ? 'प्रक्रिया...' : 'सब्सक्राइब करें'}
                        </button>
                      </form>
                    )}

                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>आज का ई-पेपर उपलब्ध है</span>
                      <button
                        onClick={() => setIsEPaperModalOpen(true)}
                        className="text-red-700 font-bold hover:underline"
                      >
                        ई-पेपर खोलें →
                      </button>
                    </div>
                  </div>

                  {/* Sidebar AdSense Display Banner */}
                  <AdSenseBanner slot="sidebar-display" />

                  {/* Live Video Bulletin Spotlight */}
                  <div className="bg-stone-900 text-white p-5 rounded-lg shadow-xs border border-stone-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                        <h3 className="font-bold text-sm font-serif">
                          डीडीएन डिजिटल बुलेटिन
                        </h3>
                      </div>
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Live
                      </span>
                    </div>

                    <div
                      onClick={() => setIsVideoModalOpen(true)}
                      className="relative aspect-video rounded overflow-hidden cursor-pointer group bg-stone-800 mb-3"
                    >
                      <img
                        src="/images/ddn_reporter_press.jpg"
                        alt="Video Bulletin"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/ddn_hero_news.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-300 opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                          <Play className="w-5 h-5 ml-0.5 fill-current" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs p-1.5 rounded text-[11px] line-clamp-1">
                        9PM प्राइम टाइम: दरभंगा एम्स और विकास
                      </div>
                    </div>

                    <button
                      onClick={() => setIsVideoModalOpen(true)}
                      className="w-full py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs font-semibold transition border border-stone-700"
                    >
                      सभी वीडियो बुलेटिन्स देखें
                    </button>
                  </div>

                  {/* Weather & AQI Barometer */}
                  <div className="bg-white p-5 rounded-lg shadow-xs border border-stone-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CloudSun className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-bold text-sm text-stone-900 font-serif">
                          मौसम एवं वायु गुणवत्ता (AQI)
                        </h3>
                      </div>
                      <span className="text-xs text-stone-500 font-medium">{activeWeatherData.city}</span>
                    </div>

                    <div className="flex items-center justify-between bg-stone-50 p-3 rounded border border-stone-100 mb-3">
                      <div>
                        <span className="text-3xl font-extrabold text-stone-900 tabular-nums">
                          {activeWeatherData.temp}°C
                        </span>
                        <p className="text-xs text-stone-500">{activeWeatherData.condition}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-stone-500">नमी: {activeWeatherData.humidity}%</p>
                        <p className="font-bold text-amber-700 font-mono">
                          AQI: {activeWeatherData.aqi} (मध्यम)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                      {weatherList.slice(0, 3).map((w) => (
                        <button
                          key={w.city}
                          onClick={() => setSelectedCity(w.city)}
                          className={`p-1.5 rounded border transition ${
                            selectedCity === w.city
                              ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          <div className="font-medium truncate">{w.city}</div>
                          <div className="font-mono text-stone-900">{w.temp}°C</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reporter Recruitment Box */}
                  <div className="bg-linear-to-br from-red-700 to-red-900 text-white p-5 rounded-lg shadow-sm border border-red-800">
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="w-5 h-5 text-yellow-300" />
                      <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                        पत्रकार भर्ती अभियान 2026
                      </span>
                    </div>
                    <h4 className="text-base font-bold font-serif mb-2 leading-snug">
                      अपने जिला व प्रखंड में बनें डीडीएन प्राइम रिपोर्टर
                    </h4>
                    <p className="text-xs text-red-100 mb-4 leading-relaxed">
                      ग्रामीण व शहरी समस्याओं को निष्पक्षता से उठाएं। डिजिटल प्रेस आईडी कार्ड प्राप्त करें।
                    </p>
                    <button
                      onClick={() => setIsReporterModalOpen(true)}
                      className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-red-950 font-bold rounded text-xs transition shadow-xs"
                    >
                      अभी आवेदन करें (Apply Online)
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </main>
      )}

      {/* 10. FOOTER & EDITORIAL DETAILS */}
      <Footer
        onOpenReporterModal={() => setIsReporterModalOpen(true)}
        onOpenReporterLogin={() => setIsReporterLoginOpen(true)}
        onOpenEPaper={() => setIsEPaperModalOpen(true)}
        onOpenLiveVideo={() => setIsVideoModalOpen(true)}
        onSelectCategory={handleSelectCategory}
        onSelectLegalPage={handleSelectLegalPage}
        onOpenAdminDesk={() => setIsAdminDeskOpen(true)}
      />

      {/* Modals */}
      <ReporterApplicationModal
        isOpen={isReporterModalOpen}
        onClose={() => setIsReporterModalOpen(false)}
      />

      <ReporterDeskModal
        isOpen={isReporterLoginOpen}
        onClose={() => setIsReporterLoginOpen(false)}
        onAddArticle={handleAddArticle}
        articles={articles}
      />

      <EPaperModal
        isOpen={isEPaperModalOpen}
        onClose={() => setIsEPaperModalOpen(false)}
        articles={publishedArticles}
        onSelectArticle={handleSelectArticle}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        bulletins={VIDEO_BULLETINS}
      />

      <AdminEditorModal
        isOpen={isAdminDeskOpen}
        onClose={() => setIsAdminDeskOpen(false)}
        onAddArticle={handleAddArticle}
        onAddBreakingNews={handleAddBreaking}
        articles={articles}
        onDeleteArticle={handleDeleteArticle}
      />
    </div>
  );
}
