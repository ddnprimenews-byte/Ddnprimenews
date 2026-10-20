import React, { useState, useEffect } from 'react';
import { Article } from '../types/news';
import { 
  X, Volume2, VolumeX, Share2, Bookmark, BookmarkCheck, 
  Printer, ArrowLeft, Clock, Eye, Check, ThumbsUp, Heart 
} from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onSelectArticle: (art: Article) => void;
  relatedArticles: Article[];
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onSelectArticle,
  relatedArticles,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingFontSize, setReadingFontSize] = useState<'base' | 'lg' | 'xl'>('base');
  const [reactions, setReactions] = useState<{ satya: number; vichar: number; sarthak: number }>({
    satya: 42,
    vichar: 18,
    sarthak: 29,
  });
  const [userVoted, setUserVoted] = useState<string | null>(null);

  useEffect(() => {
    if (!article) return;
    // Check if bookmarked
    const saved = localStorage.getItem(`ddn_bookmark_${article.id}`);
    setIsBookmarked(!!saved);

    // Stop previous audio on article change
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article]);

  if (!article) return null;

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
      alert('आपके ब्राउज़र में टेक्स्ट-टू-स्पीच उपलब्ध नहीं है।');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const fullText = `${article.title}। ${article.summary}। ${article.content.join(' ')}`;
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
      `*${article.title}*\n\n${article.summary}\n\nडीडीएन प्राइम न्यूज (दरभंगा डिजिटल नेटवर्क) पर पूरी खबर पढ़ें:\n${window.location.origin}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${article.title} - DDN Prime News: ${window.location.href}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReaction = (type: 'satya' | 'vichar' | 'sarthak') => {
    if (userVoted === type) return;
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setUserVoted(type);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-stone-200 animate-in fade-in duration-200 flex flex-col max-h-[95vh]">
        {/* Sticky Top Action Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>वापस जाएं</span>
          </button>

          <div className="flex items-center space-x-2">
            {/* Audio Button */}
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
                isPlayingAudio
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
              title="समाचार सुनें"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
              <span>{isPlayingAudio ? 'रोकें' : 'सुनें'}</span>
            </button>

            {/* Font Resize */}
            <div className="hidden sm:flex items-center bg-white border border-stone-200 rounded px-1 text-xs">
              <button
                onClick={() => setReadingFontSize('base')}
                className={`px-1.5 py-0.5 ${readingFontSize === 'base' ? 'font-bold text-red-700' : 'text-stone-500'}`}
              >
                A
              </button>
              <button
                onClick={() => setReadingFontSize('lg')}
                className={`px-1.5 py-0.5 ${readingFontSize === 'lg' ? 'font-bold text-red-700' : 'text-stone-500'}`}
              >
                A+
              </button>
              <button
                onClick={() => setReadingFontSize('xl')}
                className={`px-1.5 py-0.5 ${readingFontSize === 'xl' ? 'font-bold text-red-700' : 'text-stone-500'}`}
              >
                A++
              </button>
            </div>

            {/* Bookmark */}
            <button
              onClick={toggleBookmark}
              className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 rounded border border-stone-200 transition"
              title="खबर सुरक्षित करें"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-red-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 rounded border border-stone-200 transition hidden sm:inline-block"
              title="प्रिंट करें"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded transition ml-2"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-8 flex-grow">
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-3 flex-wrap">
            <span className="font-bold text-red-700 uppercase">{article.categoryHindi}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{article.location}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{article.publishedAt}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1 font-mono tabular-nums">
              <Eye className="w-3 h-3" />
              {article.views.toLocaleString('hi-IN')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight font-serif mb-4 text-balance">
            {article.title}
          </h1>

          {/* Author info & Bureau stamp */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200 text-xs text-stone-600">
            <div>
              <p className="font-semibold text-stone-900">
                विशेष रिपोर्ट: {article.author} ({article.authorRole})
              </p>
              <p className="text-stone-500">
                दरभंगा डिजिटल नेटवर्क (DDN Prime News) ब्यूरो डेस्क
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-stone-400">ID: {article.id}</span>
            </div>
          </div>

          {/* Main Visual */}
          <div className="mb-6 rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[460px] object-cover"
            />
            <p className="text-xs text-stone-500 italic p-2 bg-stone-50 border-t border-stone-100 text-center">
              चित्र: डीडीएन प्राइम न्यूज संवाददाता द्वारा विशेष कवरेज
            </p>
          </div>

          {/* Article Summary Lead Paragraph */}
          <div className="bg-amber-50/50 p-4 rounded-md border-l-3 border-red-600 mb-6 text-stone-800 font-medium text-sm sm:text-base leading-relaxed">
            {article.summary}
          </div>

          {/* Article Content Paragraphs with adjusted font size */}
          <div
            className={`space-y-4 text-stone-800 leading-loose ${
              readingFontSize === 'base'
                ? 'text-base'
                : readingFontSize === 'lg'
                ? 'text-lg'
                : 'text-xl'
            }`}
          >
            {article.content.map((p, i) => (
              <p key={i} className="text-justify first-letter:text-3xl first-letter:font-bold first-letter:text-red-700">
                {p}
              </p>
            ))}
          </div>

          {/* Reader Reactions */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              पाठक प्रतिक्रिया (Reader Feedback)
            </h4>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => handleReaction('satya')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                  userVoted === 'satya'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5 text-red-600" />
                <span>सत्य व प्रामाणिक ({reactions.satya})</span>
              </button>

              <button
                onClick={() => handleReaction('vichar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                  userVoted === 'vichar'
                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <span>💡 विचारणीय ({reactions.vichar})</span>
              </button>

              <button
                onClick={() => handleReaction('sarthak')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                  userVoted === 'sarthak'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-emerald-600" />
                <span>सार्थक पत्रकारिता ({reactions.sarthak})</span>
              </button>
            </div>
          </div>

          {/* Social Share Bar */}
          <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-stone-700">इस खबर को साझा करें:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition"
              >
                WhatsApp
              </button>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded text-xs font-semibold transition flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'कॉपी हो गया' : 'लिंक कॉपी करें'}</span>
              </button>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-200">
              <h4 className="text-sm font-bold text-stone-900 mb-4 font-serif">
                अन्य संबंधित खबरें
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.slice(0, 2).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectArticle(rel)}
                    className="p-3 bg-stone-50 hover:bg-stone-100 rounded border border-stone-200 cursor-pointer transition"
                  >
                    <span className="text-[11px] font-bold text-red-700">{rel.categoryHindi}</span>
                    <h5 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 mt-1">
                      {rel.title}
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
