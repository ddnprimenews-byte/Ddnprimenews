import React from 'react';
import { ExternalLink, HeartPulse, GraduationCap, Sparkles, BookOpen, Activity } from 'lucide-react';
import { Article } from '../types/news';

interface HealthEducationSectionProps {
  articles: Article[];
  onSelectArticle: (art: Article) => void;
}

export const HealthEducationSection: React.FC<HealthEducationSectionProps> = ({
  articles,
  onSelectArticle,
}) => {
  const healthArticles = articles.filter(
    (a) => a.category === 'education-health' || a.tags.some((t) => t.includes('स्वास्थ्य') || t.includes('शिक्षा'))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner Linking to Hindi Health Guide */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white rounded-xl p-6 sm:p-8 shadow-md border border-emerald-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 text-emerald-200 text-xs font-semibold px-2.5 py-1 rounded mb-3 border border-emerald-600/50">
              <HeartPulse className="w-4 h-4 text-emerald-300" />
              <span>आधिकारिक स्वास्थ्य एवं शिक्षा स्तम्भ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">
              शिक्षा & हेल्थ गाइड (Hindi Health Guide)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-2 leading-relaxed">
              दैनिक जीवन में संपूर्ण आरोग्य, आयुर्वेद, मौसमी बीमारियों से बचाव, बाल पोषण तथा उच्च शिक्षा और रोजगार के प्रामाणिक दिशा-निर्देश।
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="https://www.hindilhealthguide.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold rounded-lg shadow-sm transition active:scale-95 text-sm"
            >
              <span>पोर्टल देखें: hindilhealthguide.org</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Featured Health Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">
            मौसमी बीमारियों से बचाव
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            डेंगू, मलेरिया एवं मौसमी बुखार के लक्षण, रोकथाम के उपाय और प्राथमिक उपचार संबंधी चिकित्सकीय परामर्श।
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">
            शिक्षा एवं विश्वविद्यालय समाचार
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            ललित नारायण मिथिला विश्वविद्यालय (LNMU), कामेश्वर सिंह संस्कृत विवि एवं बिहार बोर्ड की परीक्षा सूचनाएं।
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-2xs">
          <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">
            प्रतियोगी परीक्षा मार्गदर्शन
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            BPSC, SSC, रेलवे और शिक्षक बहाली (TRE) परीक्षाओं हेतु विषयवार तैयारी रणनीति और मॉडल पेपर्स।
          </p>
        </div>
      </div>

      {/* Health & Education Articles Grid */}
      <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs">
        <h3 className="text-lg font-bold text-stone-900 font-serif mb-4 pb-2 border-b border-stone-200">
          स्वास्थ्य एवं शिक्षा विशेष आलेख
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="group cursor-pointer flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-stone-100 hover:border-emerald-300 hover:bg-emerald-50/20 transition"
            >
              <div className="w-full sm:w-36 h-28 rounded overflow-hidden bg-stone-100 shrink-0">
                <img
                  src={art.imageUrl || '/images/ddn_epaper_cover.jpg'}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/ddn_epaper_cover.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-103 transition"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span className="text-emerald-700 font-bold">{art.categoryHindi}</span>
                    <span aria-hidden="true">·</span>
                    <span>{art.readTime}</span>
                  </div>
                  <h4 className="font-bold text-stone-900 group-hover:text-emerald-800 text-sm leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold mt-2">
                  पूरा आलेख पढ़ें →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
