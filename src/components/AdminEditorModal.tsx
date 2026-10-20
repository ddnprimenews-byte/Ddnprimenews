'use client';

import React, { useState, useEffect } from 'react';
import { Article, NewsCategory, ReporterApplication } from '../types/news';
import { 
  X, PlusCircle, Trash2, CheckCircle2, ShieldCheck, 
  PenTool, AlertCircle, FileCheck, LogIn, LogOut, 
  UserCheck, Users, ExternalLink, Printer 
} from 'lucide-react';
import { 
  auth, signInWithGoogle, signOutUser, 
  saveArticleToFirestore, deleteArticleFromFirestore, 
  addBreakingNewsToFirestore, fetchReporterApplications, 
  updateReporterStatusInFirestore 
} from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AdminEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArticle: (article: Article) => void;
  onAddBreakingNews: (text: string) => void;
  articles: Article[];
  onDeleteArticle: (id: string) => void;
}

export const AdminEditorModal: React.FC<AdminEditorModalProps> = ({
  isOpen,
  onClose,
  onAddArticle,
  onAddBreakingNews,
  articles,
  onDeleteArticle,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const [tab, setTab] = useState<'article' | 'breaking' | 'reporters' | 'manage'>('article');
  const [breakingInput, setBreakingInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reporter Applications management
  const [reporterApps, setReporterApps] = useState<ReporterApplication[]>([]);
  const [isLoadingReporters, setIsLoadingReporters] = useState(false);
  const [selectedReporterForCard, setSelectedReporterForCard] = useState<ReporterApplication | null>(null);

  // Form for new article
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [summary, setSummary] = useState('');
  const [aeoSummary, setAeoSummary] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [category, setCategory] = useState<NewsCategory>('bihar');
  const [location, setLocation] = useState('दरभंगा');
  const [author, setAuthor] = useState('राजेश कुमार साहू');
  const [authorRole, setAuthorRole] = useState('मुख्य संपादक');
  const [articleStatus, setArticleStatus] = useState<'published' | 'draft'>('published');
  const [isPublishing, setIsPublishing] = useState(false);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch reporter applications when tab is clicked
  useEffect(() => {
    if (tab === 'reporters' && currentUser) {
      loadReporters();
    }
  }, [tab, currentUser]);

  const loadReporters = async () => {
    setIsLoadingReporters(true);
    try {
      const apps = await fetchReporterApplications();
      setReporterApps(apps);
    } catch (err: any) {
      console.error('Failed to load reporters:', err);
    } finally {
      setIsLoadingReporters(false);
    }
  };

  if (!isOpen) return null;

  // Verification check: Chief editor account
  const isAuthorized = currentUser?.email === 'ddnprimenews@gmail.com';

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const user = await signInWithGoogle();
      if (user && user.email !== 'ddnprimenews@gmail.com') {
        setAuthError(`खाता (${user.email}) अधिकृत नहीं है। केवल ddnprimenews@gmail.com ही संपादक डेस्क एक्सेस कर सकते हैं।`);
      }
    } catch (err: any) {
      setAuthError('लॉगिन करने में विफलता: ' + (err?.message || 'कृपया पुनः प्रयास करें।'));
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setSelectedReporterForCard(null);
  };

  const generateSlug = (text: string): string => {
    const translit = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return translit || `news-ddn-${Date.now()}`;
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    setIsPublishing(true);
    const newSlug = generateSlug(title);
    const nowIso = new Date().toISOString();

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      slug: newSlug,
      title,
      subtitle: subtitle || summary,
      summary,
      aeoSummary: aeoSummary || summary,
      content: contentBody ? contentBody.split('\n\n') : [summary],
      category,
      categoryHindi: 
        category === 'bihar' ? 'बिहार विशेष' :
        category === 'national' ? 'देश' :
        category === 'politics' ? 'राजनीति' :
        category === 'crime' ? 'अपराध' :
        category === 'sports' ? 'खेल' : 'शिक्षा & हेल्थ',
      location,
      author,
      authorRole,
      publishedAt: 'अभी-अभी',
      datePublished: nowIso,
      dateModified: nowIso,
      readTime: '2 मिनट',
      imageUrl: '/src/assets/images/ddn_hero_news_1792323529100.jpg',
      status: articleStatus,
      views: 120,
      tags: ['डीडीएन प्राइम न्यूज', location],
    };

    try {
      // Direct write to genuine Firestore
      await saveArticleToFirestore(newArticle);
      onAddArticle(newArticle);
      setSuccessMsg(
        articleStatus === 'published' 
          ? 'समाचार फायरबेस फायरस्टोर में सफलतापूर्वक लाइव प्रकाशित कर दिया गया!' 
          : 'समाचार ड्राफ्ट के रूप में फायरस्टोर में सुरक्षित हुआ (सार्वजनिक व सर्च इंजन से सुरक्षित)।'
      );
      setTitle('');
      setSubtitle('');
      setSummary('');
      setAeoSummary('');
      setContentBody('');
    } catch (err: any) {
      console.error('Firestore save article error:', err);
      setSuccessMsg('त्रुटि: समाचार फायरस्टोर में सुरक्षित नहीं हो सका।');
    } finally {
      setIsPublishing(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleAddBreaking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakingInput.trim()) return;
    const text = breakingInput.trim();

    try {
      await addBreakingNewsToFirestore(text);
      onAddBreakingNews(text);
      setSuccessMsg('ब्रेकिंग न्यूज़ फायरबेस फायरस्टोर टिकर में जोड़ दी गई है!');
      setBreakingInput('');
    } catch (err: any) {
      console.error('Firestore breaking save error:', err);
      setSuccessMsg('त्रुटि: ब्रेकिंग न्यूज़ टिकर में नहीं जुड़ सकी।');
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleApproveReporter = async (appId: string) => {
    try {
      await updateReporterStatusInFirestore(appId, 'card_generated', 'मुख्य संपादक द्वारा अधिकृत');
      setSuccessMsg(`आवेदन ${appId} स्वीकृत किया गया व प्रेस कार्ड जारी किया गया।`);
      loadReporters();
    } catch (err: any) {
      setSuccessMsg('त्रुटि: संवाददाता स्थिति अपडेट नहीं हो सकी।');
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRejectReporter = async (appId: string) => {
    if (!confirm('क्या आप वाकई इस आवेदन को अस्वीकार करना चाहते हैं?')) return;
    try {
      await updateReporterStatusInFirestore(appId, 'rejected', 'आवश्यक मानदंड पूर्ण नहीं');
      setSuccessMsg(`आवेदन ${appId} अस्वीकार कर दिया गया।`);
      loadReporters();
    } catch (err: any) {
      setSuccessMsg('त्रुटि: संवाददाता स्थिति अपडेट नहीं हो सकी।');
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('क्या आप वाकई इस समाचार को फायरस्टोर डेटाबेस से हटाना चाहते हैं?')) return;
    try {
      await deleteArticleFromFirestore(id);
      onDeleteArticle(id);
      setSuccessMsg('समाचार फायरस्टोर डेटाबेस से सफलतापूर्वक हटा दिया गया।');
    } catch (err: any) {
      setSuccessMsg('त्रुटि: समाचार हटाया नहीं जा सका।');
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-red-800 text-white px-6 py-4 flex items-center justify-between border-b border-red-900">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-yellow-300" />
            <div>
              <h3 className="font-bold text-lg font-headline tracking-wide">
                DDN Prime News — संपादक एवं एडमिन डेस्क (CMS)
              </h3>
              <p className="text-[11px] text-red-200">
                दरभंगा डिजिटल नेटवर्क (UDYAM-BR-09-0028491) | फायरबेस प्रमाणीकरण
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-red-700/60 transition text-red-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          
          {/* Check Authentication */}
          {isAuthLoading ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              प्रमाणीकरण स्थिति जांची जा रही है...
            </div>
          ) : !currentUser ? (
            /* Firebase Login Gate */
            <div className="max-w-md mx-auto py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <LogIn className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-stone-800">
                संपादकीय डेस्क में लॉगिन करें
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                यह क्षेत्र केवल अधिकृत मुख्य संपादक एवं संपादकीय टीम के लिए सुरक्षित है। समाचार प्रकाशन व संवाददाता आवेदन समीक्षा हेतु कृपया अपने आधिकारिक गूगल खाते से लॉगिन करें।
              </p>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                  {authError}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Google (ddnprimenews@gmail.com) से लॉगिन करें</span>
              </button>
            </div>
          ) : !isAuthorized ? (
            /* Unauthorized Account Notice */
            <div className="max-w-md mx-auto py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-stone-800">
                अनधिकृत खाता (Access Denied)
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                आप <strong>{currentUser.email}</strong> के रूप में लॉगिन हैं। संपादकीय डेस्क केवल मुख्य संपादक <strong>ddnprimenews@gmail.com</strong> हेतु अधिकृत है।
              </p>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                लॉग आउट करें
              </button>
            </div>
          ) : (
            /* Authenticated & Authorized Editor View */
            <div className="space-y-5">
              
              {/* Logged in User Bar */}
              <div className="flex items-center justify-between bg-stone-100 p-3 rounded-lg border border-stone-200 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-semibold text-stone-800">अधिकृत संपादक:</span>
                  <span className="text-stone-600 font-mono">{currentUser.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-red-700 hover:text-red-900 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  लॉग आउट
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-stone-200 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setTab('article')}
                  className={`py-2 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    tab === 'article' 
                      ? 'border-red-700 text-red-700' 
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  नया समाचार लिखें
                </button>

                <button
                  onClick={() => setTab('breaking')}
                  className={`py-2 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    tab === 'breaking' 
                      ? 'border-red-700 text-red-700' 
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  ब्रेकिंग टिकर जोड़ें
                </button>

                <button
                  onClick={() => setTab('reporters')}
                  className={`py-2 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    tab === 'reporters' 
                      ? 'border-red-700 text-red-700' 
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  संवाददाता आवेदन ({reporterApps.length})
                </button>

                <button
                  onClick={() => setTab('manage')}
                  className={`py-2 px-4 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                    tab === 'manage' 
                      ? 'border-red-700 text-red-700' 
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  समाचार प्रबंधन ({articles.length})
                </button>
              </div>

              {/* Success Notification */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: NEW ARTICLE */}
              {tab === 'article' && (
                <form onSubmit={handleCreateArticle} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      समाचार मुख्य शीर्षक (Headline) *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="उदा. दरभंगा एम्स निर्माण कार्य में आई तेजी, स्वास्थ्य मंत्री ने लिया जायजा"
                      className="w-full p-2.5 text-sm border border-stone-300 rounded focus:border-red-700 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">श्रेणी (Category) *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as NewsCategory)}
                        className="w-full p-2 border border-stone-300 rounded focus:border-red-700 focus:outline-none bg-white"
                      >
                        <option value="bihar">बिहार विशेष (Bihar)</option>
                        <option value="national">देश (National)</option>
                        <option value="politics">राजनीति (Politics)</option>
                        <option value="crime">अपराध (Crime)</option>
                        <option value="sports">खेल (Sports)</option>
                        <option value="education-health">शिक्षा & स्वास्थ्य (Education/Health)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">स्थान (Location)</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded focus:border-red-700 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">प्रकाशन स्थिति (Status)</label>
                      <select
                        value={articleStatus}
                        onChange={(e) => setArticleStatus(e.target.value as 'published' | 'draft')}
                        className="w-full p-2 border border-stone-300 rounded focus:border-red-700 focus:outline-none bg-white"
                      >
                        <option value="published">लाइव प्रकाशित करें (Published)</option>
                        <option value="draft">ड्राफ्ट सुरक्षित करें (Draft)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      संक्षिप्त विवरण (Executive Summary) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="आलेख का 2-3 पंक्तियों में मुख्य सार..."
                      className="w-full p-2 border border-stone-300 rounded focus:border-red-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      विस्तृत समाचार सामग्री (Article Full Body)
                    </label>
                    <textarea
                      rows={6}
                      value={contentBody}
                      onChange={(e) => setContentBody(e.target.value)}
                      placeholder="पैराग्राफ अलग करने के लिए दो बार Enter दबाएं..."
                      className="w-full p-2.5 border border-stone-300 rounded focus:border-red-700 focus:outline-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition shadow-sm"
                  >
                    {isPublishing ? 'फायरस्टोर में सुरक्षित हो रहा है...' : 'फायरबेस फायरस्टोर में समाचार प्रकाशित करें'}
                  </button>
                </form>
              )}

              {/* TAB 2: BREAKING NEWS */}
              {tab === 'breaking' && (
                <form onSubmit={handleAddBreaking} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      ताज़ा ब्रेकिंग अलर्ट (Breaking Alert Text)
                    </label>
                    <input
                      type="text"
                      required
                      value={breakingInput}
                      onChange={(e) => setBreakingInput(e.target.value)}
                      placeholder="उदा. दरभंगा-सकरी रेलखंड पर नई मेमू ट्रेन सेवा का शुभारंभ"
                      className="w-full p-2.5 border border-stone-300 rounded focus:border-red-700 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition"
                  >
                    ब्रेकिंग टिकर में जोड़ें
                  </button>
                </form>
              )}

              {/* TAB 3: REPORTER APPLICATIONS DESK */}
              {tab === 'reporters' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-600">
                      संवाददाता आवेदनों की समीक्षा करें, दस्तावेज जांचें एवं अधिकृत प्रेस मान्यता कार्ड जारी करें।
                    </p>
                    <button
                      onClick={loadReporters}
                      className="text-xs text-red-700 hover:underline font-semibold"
                    >
                      सूची ताज़ा करें (Refresh)
                    </button>
                  </div>

                  {isLoadingReporters ? (
                    <div className="text-center py-8 text-stone-500 text-xs">आवेदन लोड हो रहे हैं...</div>
                  ) : reporterApps.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs border border-dashed rounded-lg">
                      वर्तमान में कोई नया संवाददाता आवेदन उपलब्ध नहीं है।
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reporterApps.map((app) => (
                        <div key={app.id} className="p-4 border border-stone-200 rounded-lg bg-stone-50/60 hover:bg-white transition space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-2">
                            <div>
                              <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                                {app.id}
                              </span>
                              <h4 className="font-bold text-stone-900 text-sm mt-1">{app.fullName}</h4>
                              <p className="text-[11px] text-stone-500">
                                पिता: {app.fatherName || '—'} | मोबाइल: {app.mobile} | ईमेल: {app.email || '—'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                app.status === 'card_generated' || app.status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {app.status === 'card_generated' || app.status === 'verified' 
                                  ? 'सत्यापित (Approved)' 
                                  : app.status === 'rejected'
                                  ? 'अस्वीकृत (Rejected)'
                                  : 'लंबित (Pending)'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-stone-600">
                            <div>
                              <span className="text-stone-400 block text-[10px]">जिला / प्रखंड:</span>
                              <strong>{app.district} / {app.block}</strong>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[10px]">योग्यता:</span>
                              <span>{app.qualification || '—'}</span>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[10px]">अनुभव:</span>
                              <span>{app.experience || '—'}</span>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[10px]">बीट:</span>
                              <span>{app.beatPreference}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                            <div className="flex items-center gap-2">
                              {app.photoUrl && (
                                <a 
                                  href={app.photoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> फोटो देखें
                                </a>
                              )}
                              {app.idDocumentUrl && (
                                <a 
                                  href={app.idDocumentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[11px] text-purple-600 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> पहचान पत्र (ID Proof) देखें
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {app.status !== 'card_generated' && (
                                <button
                                  onClick={() => handleApproveReporter(app.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-xs"
                                >
                                  स्वीकृत करें व प्रेस कार्ड जारी करें
                                </button>
                              )}
                              {app.status !== 'rejected' && (
                                <button
                                  onClick={() => handleRejectReporter(app.id)}
                                  className="px-3 py-1 bg-stone-200 hover:bg-red-100 text-stone-700 hover:text-red-700 text-xs font-semibold rounded"
                                >
                                  अस्वीकार करें
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MANAGE ARTICLES */}
              {tab === 'manage' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-600">
                    फायरस्टोर डेटाबेस में दर्ज समाचार आलेखों की सूची। यहां से समाचार हटाए या संशोधित किए जा सकते हैं।
                  </p>
                  <div className="divide-y divide-stone-200 max-h-96 overflow-y-auto">
                    {articles.map((art) => (
                      <div key={art.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h5 className="font-semibold text-stone-900 text-xs truncate">{art.title}</h5>
                          <span className="text-[10px] text-stone-400">
                            {art.categoryHindi} | {art.location} | {art.publishedAt}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded transition"
                          title="समाचार हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
