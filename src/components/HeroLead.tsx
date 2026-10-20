import React from 'react';
import { Article } from '../types/news';
import { Volume2, Share2, Eye, ArrowUpRight, Check } from 'lucide-react';

interface HeroLeadProps {
  leadArticle: Article;
  sideArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onListenArticle: (article: Article) => void;
}

export const HeroLead: React.FC<HeroLeadProps> = ({
  leadArticle,
  sideArticles,
  onSelectArticle,
  onListenArticle,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: art.title,
        text: art.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${art.title} - DDN Prime News: ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    const text = encodeURIComponent(`*${art.title}*\n\n${art.summary}\n\nडीडीएन प्राइम न्यूज (दरभंगा डिजिटल नेटवर्क) पर पूरी खबर पढ़ें:\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <section className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
        {/* Main Lead Story (8 cols) */}
        <div
          onClick={() => onSelectArticle(leadArticle)}
          className="lg:col-span-8 p-5 sm:p-7 cursor-pointer group hover:bg-stone-50/50 transition-colors flex flex-col justify-between"
        >
          <div>
            {/* Zero-Pill Clean Metadata */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-stone-500 mb-2.5">
              <span className="text-red-700 font-bold uppercase tracking-wider">
                {leadArticle.categoryHindi}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>{leadArticle.location}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>{leadArticle.publishedAt}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-stone-400" />
                <span className="tabular-nums font-mono">{leadArticle.views.toLocaleString('hi-IN')}</span>
              </span>
            </div>

            {/* Lead Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight group-hover:text-red-700 transition-colors font-serif mb-4 text-balance">
              {leadArticle.title}
            </h1>

            {/* Lead Image */}
            <div className="relative aspect-video w-full rounded-md overflow-hidden bg-stone-100 mb-4 border border-stone-200">
              <img
                src={leadArticle.imageUrl}
                alt={leadArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-mono">
                डीडीएन एक्सक्लूसिव
              </div>
            </div>

            {/* Summary */}
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-4">
              {leadArticle.summary}
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-stone-500">
              लेखक: <span className="font-semibold text-stone-800">{leadArticle.author}</span> ({leadArticle.authorRole})
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onListenArticle(leadArticle);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 rounded text-xs font-semibold transition border border-stone-200"
                title="समाचार सुनें"
              >
                <Volume2 className="w-3.5 h-3.5 text-red-600" />
                <span>खबर सुनें</span>
              </button>

              <button
                onClick={(e) => handleWhatsAppShare(e, leadArticle)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition"
                title="व्हाट्सएप पर शेयर करें"
              >
                <span>WhatsApp</span>
              </button>

              <button
                onClick={(e) => handleShare(e, leadArticle)}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-xs transition border border-stone-200"
                title="लिंक कॉपी करें"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Side Column: 3 Top Stories (4 cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-stone-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                महत्वपूर्ण सुर्खियां
              </h2>
              <span className="text-xs text-stone-500 font-mono">24×7 लाइव</span>
            </div>

            <div className="space-y-4">
              {sideArticles.slice(0, 3).map((art, idx) => (
                <article
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="group cursor-pointer pb-4 border-b border-stone-200/70 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span className="text-red-700 font-bold">{art.categoryHindi}</span>
                    <span aria-hidden="true">·</span>
                    <span>{art.publishedAt}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-red-700 transition leading-snug line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="mt-6 pt-4 border-t border-stone-200 bg-amber-50/70 p-3.5 rounded border border-amber-200 text-xs">
            <p className="font-semibold text-amber-950 mb-1">
              📢 जिला संवाददाताओं की आवश्यकता
            </p>
            <p className="text-amber-900/80 leading-relaxed text-[11px]">
              डीडीएन प्राइम न्यूज को बिहार के सभी जिलों व प्रखंडों में जागरूक संवाददाताओं की जरूरत है।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
