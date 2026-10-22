import React from 'react';
import { Article } from '../types/news';
import { Eye, Share2, Volume2, Clock } from 'lucide-react';

interface NewsCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  onListen: (article: Article) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onSelect, onListen }) => {
  const [imgSrc, setImgSrc] = React.useState(article.imageUrl || '/images/ddn_hero_news.jpg');
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(article.imageUrl || '/images/ddn_hero_news.jpg');
    setHasError(false);
  }, [article.imageUrl]);

  const handleImageError = () => {
    if (imgSrc !== '/images/ddn_hero_news.jpg') {
      setImgSrc('/images/ddn_hero_news.jpg');
    } else {
      setHasError(true);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(`*${article.title}*\n\nडीडीएन प्राइम न्यूज पर पढ़ें:\n${typeof window !== 'undefined' ? window.location.href : ''}`);
    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  return (
    <article
      onClick={() => onSelect(article)}
      className="bg-white rounded-lg border border-stone-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Card Image */}
        <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden border-b border-stone-100">
          {!hasError ? (
            <img
              src={imgSrc}
              alt={article.title}
              onError={handleImageError}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 p-4 text-center">
              <span className="font-serif font-black text-2xl text-stone-300">DDN</span>
              <span className="text-xs text-stone-500 mt-1">{article.categoryHindi}</span>
            </div>
          )}
          <span className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
            {article.location}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4">
          {/* Zero-Pill Clean Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-2 flex-wrap">
            <span className="font-bold text-red-700">{article.categoryHindi}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{article.publishedAt}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{article.readTime}</span>
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-red-700 transition leading-snug line-clamp-2 mb-2 font-serif">
            {article.title}
          </h3>

          {/* Summary */}
          <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed">
            {article.summary}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2.5 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span className="truncate max-w-[120px]">
          {article.author}
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onListen(article);
            }}
            className="p-1 hover:text-red-700 hover:bg-stone-200/50 rounded transition"
            title="खबर सुनें"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleWhatsApp}
            className="p-1 hover:text-emerald-700 hover:bg-stone-200/50 rounded transition"
            title="व्हाट्सएप पर भेजें"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <span className="flex items-center gap-1 font-mono text-[11px] tabular-nums text-stone-400 pl-1 border-l border-stone-200">
            <Eye className="w-3 h-3" />
            {article.views.toLocaleString('hi-IN')}
          </span>
        </div>
      </div>
    </article>
  );
};
