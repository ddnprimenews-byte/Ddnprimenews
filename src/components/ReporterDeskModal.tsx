'use client';

import React, { useState } from 'react';
import { Article, NewsCategory } from '../types/news';
import { 
  X, PenTool, CheckCircle2, ShieldCheck, 
  LogIn, LogOut, UserCheck, Sparkles, Loader2, 
  FileText, MapPin, Eye, Lock, Mail, AlertCircle, Building, Flag, Compass
} from 'lucide-react';
import { saveArticleToFirestore } from '../lib/firebase';
import { OptimizedImageUploader } from './OptimizedImageUploader';
import { 
  BIHAR_DISTRICTS, 
  INDIA_STATES, 
  getBiharBlocks, 
  getStateDistricts 
} from '../data/locationsData';

interface ReporterDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArticle: (article: Article) => void;
  articles: Article[];
}

interface ReporterUser {
  id: string;
  name: string;
  email: string;
  role: string;
  district: string;
  pressId: string;
}

// पूर्व-सत्यापित रिपोर्टर खाते (Pre-configured Verified Reporter Accounts)
const VERIFIED_REPORTERS: Record<string, { pass: string; user: ReporterUser }> = {
  'sanjay.reporter@ddnprimenews.com': {
    pass: 'Reporter@123',
    user: {
      id: 'rep-01',
      name: 'संजय चौधरी',
      email: 'sanjay.reporter@ddnprimenews.com',
      role: 'वरिष्ठ संवाददाता',
      district: 'दरभंगा',
      pressId: 'DDN-REP-2026-0842',
    },
  },
  'amit.reporter@ddnprimenews.com': {
    pass: 'Reporter@123',
    user: {
      id: 'rep-02',
      name: 'अमित आनंद',
      email: 'amit.reporter@ddnprimenews.com',
      role: 'विशेष संवाददाता',
      district: 'मिथिलांचल / समस्तीपुर',
      pressId: 'DDN-REP-2026-0843',
    },
  },
  'reporter@ddnprimenews.com': {
    pass: 'DdnReporter@2026',
    user: {
      id: 'rep-03',
      name: 'मुकेश कुमार',
      email: 'reporter@ddnprimenews.com',
      role: 'जिला संवाददाता',
      district: 'दरभंगा / बिहार',
      pressId: 'DDN-REP-2026-0901',
    },
  },
};

export const ReporterDeskModal: React.FC<ReporterDeskModalProps> = ({
  isOpen,
  onClose,
  onAddArticle,
  articles,
}) => {
  // Login State
  const [currentUser, setCurrentUser] = useState<ReporterUser | null>(null);
  const [emailInput, setEmailInput] = useState('sanjay.reporter@ddnprimenews.com');
  const [passwordInput, setPasswordInput] = useState('Reporter@123');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs for logged in reporter: 'compose' or 'my-articles'
  const [activeTab, setActiveTab] = useState<'compose' | 'my-articles'>('compose');

  // Form states for drafting news
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [summary, setSummary] = useState('');
  const [aeoSummary, setAeoSummary] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [category, setCategory] = useState<NewsCategory>('bihar');
  const [location, setLocation] = useState('दरभंगा');

  // 1. Bihar Category Specific Hierarchy (जिला एवं प्रखंड)
  const [biharDistrict, setBiharDistrict] = useState('दरभंगा');
  const [biharBlock, setBiharBlock] = useState('बेनीपुर');
  const [customBiharBlock, setCustomBiharBlock] = useState('');
  const [panchayatWard, setPanchayatWard] = useState('');

  // 2. National (देश) Category Specific Hierarchy (राज्य एवं जिला/शहर)
  const [nationalState, setNationalState] = useState('उत्तर प्रदेश');
  const [nationalDistrict, setNationalDistrict] = useState('लखनऊ');
  const [customNationalDistrict, setCustomNationalDistrict] = useState('');

  // 3. Other Categories Location State
  const [otherCategoryLocation, setOtherCategoryLocation] = useState('दरभंगा / बिहार');

  const [uploadedImageUrl, setUploadedImageUrl] = useState('/images/ddn_hero_news.jpg');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Computed location string based on active category
  const getEffectiveLocation = (): string => {
    if (category === 'bihar') {
      const activeBlock = biharBlock === 'अन्य प्रखंड (मैन्युअल लिखें)'
        ? customBiharBlock.trim()
        : biharBlock;
      let loc = biharDistrict;
      if (activeBlock) {
        loc += ` (प्रखंड: ${activeBlock})`;
      }
      if (panchayatWard.trim()) {
        loc += ` · ${panchayatWard.trim()}`;
      }
      return loc;
    } else if (category === 'national') {
      const activeDist = nationalDistrict === 'अन्य जिला (मैन्युअल लिखें)'
        ? customNationalDistrict.trim()
        : nationalDistrict;
      if (activeDist) {
        return `${nationalState} (${activeDist})`;
      }
      return nationalState;
    } else {
      return otherCategoryLocation.trim() || location.trim() || currentUser?.district || 'बिहार';
    }
  };

  if (!isOpen) return null;

  // Handle Reporter Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const emailTrimmed = emailInput.trim().toLowerCase();
    const match = VERIFIED_REPORTERS[emailTrimmed];

    setTimeout(() => {
      setIsLoggingIn(false);
      if (match && match.pass === passwordInput) {
        setCurrentUser(match.user);
        setLocation(match.user.district.split('/')[0].trim());
        setSuccessMsg(`स्वागत है, ${match.user.name}! आपका रिपोर्टर सत्र प्रारंभ हो गया है।`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setLoginError('अमान्य ईमेल आईडी या पासवर्ड! कृपया सही विवरण दर्ज करें।');
      }
    }, 400);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSuccessMsg('');
    setLoginError('');
  };

  // Quick Demo Login Helper
  const handleQuickLogin = (email: string) => {
    setEmailInput(email);
    const item = VERIFIED_REPORTERS[email];
    if (item) {
      setPasswordInput(item.pass);
      setCurrentUser(item.user);
      setLocation(item.user.district.split('/')[0].trim());
      setSuccessMsg(`सत्यापित रिपोर्टर (${item.user.name}) के रूप में लॉगिन सफल!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // AI Auto-Fill / Summarizer
  const handleAiAutoFill = async () => {
    if (!title && !contentBody) {
      alert('कृपया पहले शीर्षक या समाचार का कुछ अंश दर्ज करें।');
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          summary,
          content: contentBody,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      }
      if (data.keyTakeaway) {
        setAeoSummary(data.keyTakeaway);
      }
      if (data.bulletPoints && data.bulletPoints.length > 0 && !subtitle) {
        setSubtitle(data.bulletPoints.join(' · '));
      }
    } catch (e) {
      console.warn('AI assist notice:', e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const generateSlug = (text: string): string => {
    const translit = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return translit || `news-ddn-${Date.now()}`;
  };

  // Submit news
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !currentUser) return;

    setIsPublishing(true);
    const newSlug = generateSlug(title);
    const nowIso = new Date().toISOString();

    const finalLocation = getEffectiveLocation();

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      slug: newSlug,
      title: title.trim(),
      subtitle: subtitle.trim() || summary.trim(),
      summary: summary.trim(),
      aeoSummary: aeoSummary.trim() || summary.trim(),
      content: contentBody.trim() ? contentBody.split('\n\n') : [summary.trim()],
      category,
      categoryHindi: 
        category === 'bihar' ? 'बिहार विशेष' :
        category === 'national' ? 'देश' :
        category === 'politics' ? 'राजनीति' :
        category === 'crime' ? 'अपराध' :
        category === 'sports' ? 'खेल' :
        category === 'entertainment' ? 'मनोरंजन एवं सिनेमा' : 'शिक्षा & हेल्थ',
      location: finalLocation,
      author: currentUser.name,
      authorRole: currentUser.role,
      publishedAt: 'अभी-अभी (रिपोर्टर प्रेषित)',
      datePublished: nowIso,
      dateModified: nowIso,
      readTime: '2 मिनट',
      imageUrl: uploadedImageUrl || '/images/ddn_hero_news.jpg',
      status: 'published',
      views: 1,
      tags: ['डीडीएन प्राइम न्यूज', finalLocation, currentUser.name],
    };

    try {
      // Direct Firestore write and immediate sync to portal & admin desk
      await saveArticleToFirestore(newArticle);
      onAddArticle(newArticle);

      // Reset form
      setTitle('');
      setSubtitle('');
      setSummary('');
      setAeoSummary('');
      setContentBody('');
      setVideoUrl('');
      setSuccessMsg(`समाचार सफलतापूर्वक सबमिट व प्रकाशित कर दिया गया है! शीर्षक: "${newArticle.title}"`);
      setActiveTab('my-articles');
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: any) {
      console.error('Error submitting reporter article:', err);
      // Still update locally for user resilience
      onAddArticle(newArticle);
      setSuccessMsg(`समाचार सफलतापूर्वक सबमिट हो गया है! (लोकल सिंक)`);
      setActiveTab('my-articles');
    } finally {
      setIsPublishing(false);
    }
  };

  // Reporter's personal news list
  const myArticles = currentUser 
    ? articles.filter(a => a.author === currentUser.name || a.tags?.includes(currentUser.name))
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex justify-center p-2 sm:p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-stone-200 flex flex-col max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="bg-[#800000] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-950/80 border border-amber-400 flex items-center justify-center text-amber-300">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-serif tracking-tight text-white">
                  डीडीएन प्राइम रिपोर्टर डेस्क (Reporter Login)
                </h2>
                <span className="bg-amber-400 text-red-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                  पत्रकार पोर्टल
                </span>
              </div>
              <p className="text-xs text-red-200">
                दरभंगा डिजिटल नेटवर्क · अधिकृत संवाददाता समाचार लेखन एवं सबमिशन पोर्टल
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-red-900 transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Info Toast */}
        {successMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-200" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-white hover:text-stone-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-stone-50">
          
          {/* ========================================================= */}
          {/* VIEW 1: LOGIN FORM (If not logged in)                     */}
          {/* ========================================================= */}
          {!currentUser ? (
            <div className="max-w-md mx-auto py-4 space-y-6">
              
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-full bg-red-100 text-red-800 mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-stone-900">
                  अधिकृत रिपोर्टर लॉगिन
                </h3>
                <p className="text-xs text-stone-500">
                  समाचार सबमिट करने के लिए अपनी अधिकृत ईमेल आईडी और पासवर्ड दर्ज करें।
                </p>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    रिपोर्टर ईमेल आईडी (Email ID)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="reporter@ddnprimenews.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900 bg-stone-50"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    पासवर्ड (Password)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900 bg-stone-50"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सत्यापित हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>रिपोर्टर लॉगिन करें</span>
                    </>
                  )}
                </button>
              </form>

              {/* Pre-Configured Test Credentials Box for Admin/Owner Check */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>सत्यापित रिपोर्टर लॉगिन क्रेडेंशियल्स (जांच हेतु):</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  पोर्टल में कार्यरत रिपोर्टर <strong>संजय चौधरी</strong> के विवरण से लॉगिन करने हेतु नीचे क्लिक करें या आईडी दर्ज करें:
                </p>
                <div className="bg-white p-2.5 rounded border border-amber-200 font-mono text-[11px] space-y-1">
                  <div><strong>ईमेल:</strong> sanjay.reporter@ddnprimenews.com</div>
                  <div><strong>पासवर्ड:</strong> Reporter@123</div>
                  <div className="text-[10px] text-stone-500 font-sans">पद: वरिष्ठ संवाददाता / दरभंगा डेस्क</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('sanjay.reporter@ddnprimenews.com')}
                  className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>एक-क्लिक में संजय चौधरी (रिपोर्टर) से लॉगिन करें</span>
                </button>
              </div>

            </div>
          ) : (
            /* ========================================================= */
            /* VIEW 2: LOGGED-IN REPORTER DASHBOARD                      */
            /* ========================================================= */
            <div className="space-y-5">
              
              {/* Reporter Profile Header Bar */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-800 text-white flex items-center justify-center font-black text-lg border-2 border-amber-400">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-900 font-serif">
                        {currentUser.name}
                      </h3>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        सत्यापित रिपोर्टर
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      {currentUser.role} · {currentUser.district} · आईडी: <strong className="font-mono text-stone-700">{currentUser.pressId}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-stone-300 cursor-pointer"
                    title="लॉगआउट करें"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>लॉगआउट</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center border-b border-stone-300 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className={`pb-2.5 px-4 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                    activeTab === 'compose'
                      ? 'border-red-700 text-red-800'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>नया समाचार लिखें (Compose News)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('my-articles')}
                  className={`pb-2.5 px-4 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-b-2 ${
                    activeTab === 'my-articles'
                      ? 'border-red-700 text-red-800'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>मेरे सबमिट किए गए समाचार ({myArticles.length})</span>
                </button>
              </div>

              {/* TAB 1: NEWS COMPOSITION FORM (Same as Admin Desk) */}
              {activeTab === 'compose' && (
                <form onSubmit={handleSubmitArticle} className="space-y-4 bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                  
                  {/* Top Helpers */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <span className="text-xs font-bold text-stone-700">
                      समाचार विवरण दर्ज करें (यह खबर सीधे पोर्टल व एडमिन डेस्क पर जाएगी)
                    </span>
                    <button
                      type="button"
                      onClick={handleAiAutoFill}
                      disabled={isAiGenerating}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded text-xs font-black transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="शीर्षक से सारांश और उप-शीर्षक स्वतः भरें"
                    >
                      {isAiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-red-950" />}
                      <span>AI ऑटो-फिल</span>
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      समाचार का मुख्य शीर्षक (Headline) *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="उदा. दरभंगा में नई सड़क परियोजना का शुभारंभ, 10 गांवों को मिलेगा सीधा लाभ"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900 font-serif font-bold"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      उप-शीर्षक / मुख्य बिंदु (Subtitle / Key Highlight)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="उदा. ग्रामीण विकास विभाग ने 25 करोड़ की राशि स्वीकृत की, कार्य शीघ्र होगा शुरू"
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900"
                    />
                  </div>

                  {/* Category & Location Hierarchy */}
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-red-700" />
                        <span>समाचार की श्रेणी (News Category) *</span>
                      </label>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                        {category === 'bihar' ? 'बिहार विशेष' :
                         category === 'national' ? 'देश / राष्ट्रीय' :
                         category === 'politics' ? 'राजनीति' :
                         category === 'crime' ? 'अपराध' :
                         category === 'sports' ? 'खेल जगत' :
                         category === 'entertainment' ? 'मनोरंजन' : 'शिक्षा एवं स्वास्थ्य'}
                      </span>
                    </div>

                    <select
                      value={category}
                      onChange={(e) => {
                        const newCat = e.target.value as NewsCategory;
                        setCategory(newCat);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900 bg-white shadow-xs cursor-pointer"
                    >
                      <option value="bihar">📍 बिहार विशेष (District एवं प्रखंड चयन)</option>
                      <option value="national">🇮🇳 देश / राष्ट्रीय (सभी 28 राज्य व 8 UTs + जिला/शहर चयन)</option>
                      <option value="politics">🏛️ राजनीति (Politics)</option>
                      <option value="crime">🚨 अपराध (Crime / Law & Order)</option>
                      <option value="sports">🏆 खेल जगत (Sports)</option>
                      <option value="entertainment">🎬 मनोरंजन एवं सिनेमा (Entertainment)</option>
                      <option value="education-health">📚 शिक्षा एवं स्वास्थ्य (Education & Health)</option>
                    </select>

                    {/* DYNAMIC BIHAR LOCATION HIERARCHY */}
                    {category === 'bihar' && (
                      <div className="p-3 bg-red-50/70 rounded-lg border border-red-200 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-red-900 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-700" />
                            <span>बिहार कार्यक्षेत्र विवरण (District &amp; प्रखंड)</span>
                          </span>
                          <span className="text-[10px] text-red-700 bg-red-100 px-2 py-0.5 rounded font-mono font-bold">
                            बिहार विशेष
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* 1. Bihar District Selector (All 38 Districts) */}
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">
                              ज़िला चुनें (District) *
                            </label>
                            <select
                              value={biharDistrict}
                              onChange={(e) => {
                                const newDist = e.target.value;
                                setBiharDistrict(newDist);
                                const blocks = getBiharBlocks(newDist);
                                if (blocks.length > 0) {
                                  setBiharBlock(blocks[0]);
                                }
                              }}
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-stone-900 font-medium"
                            >
                              {BIHAR_DISTRICTS.map((d) => (
                                <option key={d.id} value={d.nameHindi}>
                                  {d.nameHindi} ({d.nameEnglish})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 2. Bihar Prakhand / Block Selector */}
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">
                              प्रखंड / तहसील (Block / Tehsil) *
                            </label>
                            <select
                              value={biharBlock}
                              onChange={(e) => setBiharBlock(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-stone-900 font-medium"
                            >
                              {getBiharBlocks(biharDistrict).map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                              <option value="अन्य प्रखंड (मैन्युअल लिखें)">
                                + अन्य प्रखंड (मैन्युअल लिखें)
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* Custom block input if selected */}
                        {biharBlock === 'अन्य प्रखंड (मैन्युअल लिखें)' && (
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">
                              प्रखंड का नाम लिखें:
                            </label>
                            <input
                              type="text"
                              value={customBiharBlock}
                              onChange={(e) => setCustomBiharBlock(e.target.value)}
                              placeholder="उदा. बेनीपुर, मनीगाछी, बहादुरपुर आदि"
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-stone-900"
                            />
                          </div>
                        )}

                        {/* Optional Panchayat/Ward */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">
                            पंचायत / वार्ड / क्षेत्र (वैकल्पिक)
                          </label>
                          <input
                            type="text"
                            value={panchayatWard}
                            onChange={(e) => setPanchayatWard(e.target.value)}
                            placeholder="उदा. पैगंबरपुर पंचायत / वार्ड संख्या 4 / मुख्य चौक"
                            className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-stone-900"
                          />
                        </div>

                        {/* Location Preview Tag */}
                        <div className="flex items-center gap-1.5 text-[11px] text-red-950 bg-red-100/70 p-1.5 rounded border border-red-200">
                          <span className="font-bold">स्थान पूर्वावलोकन (Location Tag):</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded text-red-800 font-bold border border-red-200">
                            {getEffectiveLocation()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC NATIONAL LOCATION HIERARCHY */}
                    {category === 'national' && (
                      <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-300 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-950 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-amber-700" />
                            <span>देश (National) कार्यक्षेत्र: राज्य एवं जिला / शहर</span>
                          </span>
                          <span className="text-[10px] text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded font-mono font-bold">
                            संपूर्ण भारत (All States &amp; UTs)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* 1. Indian States Dropdown (All 28 States + 8 UTs) */}
                          <div>
                            <label className="block text-[11px] font-bold text-amber-950 mb-1">
                              राज्य चुनें (State / UT) *
                            </label>
                            <select
                              value={nationalState}
                              onChange={(e) => {
                                const newSt = e.target.value;
                                setNationalState(newSt);
                                const dists = getStateDistricts(newSt);
                                if (dists.length > 0) {
                                  setNationalDistrict(dists[0]);
                                }
                              }}
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-stone-900 font-medium"
                            >
                              {INDIA_STATES.map((st) => (
                                <option key={st.id} value={st.nameHindi}>
                                  {st.nameHindi} ({st.nameEnglish})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 2. State District / City Selector */}
                          <div>
                            <label className="block text-[11px] font-bold text-amber-950 mb-1">
                              जिला / महानगर / शहर (District / City) *
                            </label>
                            <select
                              value={nationalDistrict}
                              onChange={(e) => setNationalDistrict(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-stone-900 font-medium"
                            >
                              {getStateDistricts(nationalState).map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                              <option value="अन्य जिला (मैन्युअल लिखें)">
                                + अन्य जिला / शहर (मैन्युअल लिखें)
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* Custom National District if selected */}
                        {nationalDistrict === 'अन्य जिला (मैन्युअल लिखें)' && (
                          <div>
                            <label className="block text-[11px] font-bold text-amber-950 mb-1">
                              जिला / शहर का नाम दर्ज करें:
                            </label>
                            <input
                              type="text"
                              value={customNationalDistrict}
                              onChange={(e) => setCustomNationalDistrict(e.target.value)}
                              placeholder="उदा. गाजियाबाद, वाराणसी, प्रयागराज आदि"
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-stone-900"
                            />
                          </div>
                        )}

                        {/* Location Preview Tag */}
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-950 bg-amber-100/70 p-1.5 rounded border border-amber-200">
                          <span className="font-bold">राष्ट्रीय लोकेशन टैग:</span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded text-amber-900 font-bold border border-amber-300">
                            {getEffectiveLocation()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* OTHER CATEGORIES LOCATION */}
                    {category !== 'bihar' && category !== 'national' && (
                      <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 space-y-2">
                        <label className="block text-[11px] font-bold text-stone-700">
                          समाचार स्थान (Location Tag) *
                        </label>
                        <input
                          type="text"
                          value={otherCategoryLocation}
                          onChange={(e) => setOtherCategoryLocation(e.target.value)}
                          placeholder="उदा. दरभंगा, पटना, नई दिल्ली..."
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 bg-white text-stone-900"
                        />
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] text-stone-500 font-bold">त्वरित चयन:</span>
                          {['दरभंगा', 'पटना', 'मिथिलांचल', 'नई दिल्ली', 'बिहार'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setOtherCategoryLocation(preset)}
                              className="text-[10px] px-2 py-0.5 rounded bg-white border border-stone-300 hover:border-red-600 text-stone-700 font-medium cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Author (Locked to logged-in reporter) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <div>
                      <span className="block text-[11px] font-bold text-stone-600">रिपोर्टर नाम (Author):</span>
                      <span className="text-xs font-bold text-stone-900">{currentUser.name}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-stone-600">पद / डेजिग्नेशन:</span>
                      <span className="text-xs text-stone-700">{currentUser.role} ({currentUser.pressId})</span>
                    </div>
                  </div>

                  {/* Image Uploader with 16:9 Aspect Ratio Enforcement */}
                  <div>
                    <OptimizedImageUploader
                      label="समाचार की मुख्य फ़ोटो (16:9 मानक न्यूज़ बैनर)"
                      aspectRatio="16:9"
                      currentImageUrl={uploadedImageUrl}
                      onImageSelected={(compResult, uploadedUrl) => {
                        if (uploadedUrl) {
                          setUploadedImageUrl(uploadedUrl);
                        } else {
                          setUploadedImageUrl(compResult.dataUrl);
                        }
                      }}
                    />
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      संक्षिप्त सार (Summary / 2-3 पंक्तियों में) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="खबर का मुख्य सार दर्ज करें जो पाठकों को सबसे पहले दिखाई देगा..."
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900"
                    />
                  </div>

                  {/* Full Content */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      विस्तृत समाचार (Full Story Paragraphs)
                    </label>
                    <textarea
                      rows={5}
                      value={contentBody}
                      onChange={(e) => setContentBody(e.target.value)}
                      placeholder="पूरी खबर विस्तार से लिखें। पैराग्राफ बदलने के लिए Enter दो बार दबाएं..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPublishing}
                      className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>समाचार सबमिट हो रहा है...</span>
                        </>
                      ) : (
                        <>
                          <PenTool className="w-4 h-4" />
                          <span>समाचार प्रकाशित एवं सबमिट करें (Publish Article)</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

              {/* TAB 2: MY SUBMITTED ARTICLES */}
              {activeTab === 'my-articles' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 pb-1">
                    <span>{currentUser.name} द्वारा सबमिट की गई खबरें ({myArticles.length})</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('compose')}
                      className="text-red-700 hover:underline"
                    >
                      + नई खबर लिखें
                    </button>
                  </div>

                  {myArticles.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-stone-200 text-center space-y-2">
                      <FileText className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="text-xs font-bold text-stone-700">अभी तक कोई समाचार सबमिट नहीं किया गया है।</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('compose')}
                        className="px-3 py-1.5 bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        पहली खबर लिखें
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {myArticles.map((art) => (
                        <div key={art.id} className="bg-white p-3.5 rounded-xl border border-stone-200 flex items-start gap-3 shadow-xs">
                          {art.imageUrl && (
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className="w-16 h-16 rounded object-cover shrink-0 border border-stone-200"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                                {art.categoryHindi}
                              </span>
                              <span className="text-[10px] text-stone-500">{art.publishedAt}</span>
                            </div>
                            <h4 className="text-xs font-bold text-stone-900 truncate mt-1">
                              {art.title}
                            </h4>
                            <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                              {art.summary}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                            लाइव
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-stone-200 px-5 py-3 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>दरभंगा डिजिटल नेटवर्क (MSME Reg.)</span>
          <span className="font-mono text-[11px]">रिपोर्टर पोर्टल संस्करण: 2026.1</span>
        </div>

      </div>
    </div>
  );
};
