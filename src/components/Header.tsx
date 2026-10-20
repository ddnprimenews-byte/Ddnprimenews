'use client';

import React from 'react';
import { Newspaper, Search, ShieldCheck, Video, Lock } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenEPaper: () => void;
  onOpenLiveVideo: () => void;
  onOpenAdminDesk: () => void;
  onBackToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenEPaper,
  onOpenLiveVideo,
  onOpenAdminDesk,
  onBackToHome,
}) => {
  return (
    <header className="bg-white border-b border-stone-200 shadow-xs py-2.5 sm:py-3.5 px-3 sm:px-4 sticky top-0 z-40 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Brand Zone */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <a
            href="/"
            onClick={(e) => {
              if (onBackToHome) {
                e.preventDefault();
                onBackToHome();
              }
            }}
            className="flex items-center space-x-2.5 sm:space-x-3 group cursor-pointer"
          >
            <div className="bg-red-600 group-hover:bg-red-700 text-white font-black text-xl sm:text-3xl px-2.5 sm:px-3 py-1 sm:py-1.5 rounded tracking-tighter shadow-sm transition">
              DDN
            </div>
            <div>
              <div className="flex items-baseline space-x-1 sm:space-x-1.5 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold tracking-tight text-stone-900 font-serif">
                  DDN PRIME <span className="text-red-600">NEWS</span>
                </span>
                <span className="text-[11px] sm:text-sm font-semibold text-stone-600">
                  (डीडीएन प्राइम न्यूज)
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 font-medium tracking-wide">
                दरभंगा डिजिटल नेटवर्क · सच्ची, निर्भीक और निष्पक्ष पत्रकारिता
              </p>
            </div>
          </a>

          {/* Mobile MSME Tag & Mobile Quick Login */}
          <div className="flex items-center gap-1.5 md:hidden">
            <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-700" />
              MSME
            </span>
            <button
              onClick={onOpenAdminDesk}
              className="flex items-center gap-1 px-2 py-1 bg-stone-900 text-white rounded text-[11px] font-semibold shadow-xs active:scale-95 cursor-pointer"
              title="रिपोर्टिंग लॉगिन / संपादक डेस्क"
            >
              <Lock className="w-3 h-3 text-yellow-400" />
              <span>लॉगिन</span>
            </button>
          </div>
        </div>

        {/* Center / Right Zone: Search, MSME seal & Quick Affordances */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full md:w-auto justify-end">
          {/* Live Search */}
          <div className="relative flex-grow md:w-60 lg:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="खबरें, जिला या मुद्दा खोजें..."
              className="w-full pl-9 pr-7 py-1.5 text-xs sm:text-sm bg-stone-100/90 hover:bg-stone-100 focus:bg-white border border-stone-200 focus:border-red-600 rounded-md focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                title="खोज साफ़ करें"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Action: E-Paper */}
          <button
            onClick={onOpenEPaper}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-xs font-semibold border border-stone-200 transition shrink-0 cursor-pointer active:scale-95"
            title="दैनिक ई-पेपर पढ़ें"
          >
            <Newspaper className="w-3.5 h-3.5 text-red-600" />
            <span>ई-पेपर</span>
          </button>

          {/* Quick Action: Video Bulletins */}
          <button
            onClick={onOpenLiveVideo}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold border border-red-200 transition shrink-0 cursor-pointer active:scale-95"
            title="डीडीएन डिजिटल बुलेटिन"
          >
            <Video className="w-3.5 h-3.5 text-red-600" />
            <span>लाइव बुलेटिन</span>
          </button>

          {/* Desktop Reporting / Editor Login Button */}
          <button
            onClick={onOpenAdminDesk}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-md text-xs font-bold transition shrink-0 cursor-pointer shadow-sm active:scale-95"
            title="संपादक / रिपोर्टिंग लॉगिन"
          >
            <Lock className="w-3.5 h-3.5 text-yellow-400" />
            <span>संपादक / रिपोर्टिंग लॉगिन</span>
          </button>

          {/* Desktop MSME Seal */}
          <div className="hidden xl:flex items-center gap-1.5 bg-amber-50 text-amber-900 px-2.5 py-1 rounded border border-amber-300 text-xs font-semibold shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>MSME Reg.</span>
          </div>
        </div>
      </div>
    </header>
  );
};
