"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Radio, Newspaper } from "lucide-react";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenEPaper?: () => void;
  onOpenLiveVideo?: () => void;
  onOpenAdminDesk?: () => void;
  onBackToHome?: () => void;
  onSelectCategory?: (category: any) => void;
}

export default function Header({
  searchQuery = "",
  onSearchChange,
  onOpenEPaper,
  onOpenLiveVideo,
  onOpenAdminDesk,
  onBackToHome,
  onSelectCategory,
}: HeaderProps) {
  const [currentDate, setCurrentDate] = useState("");
  const [fontSize, setFontSize] = useState(100); // Percentage for auto scaling/resizing
  const [internalSearch, setInternalSearch] = useState(searchQuery);

  const LOGO_URL = "/logo.png";
  const FALLBACK_LOGO = "https://i.ibb.co/VY9xs9J3/file-0000000042f88211ae847c19f18a28c0.png";
  const HEALTH_GUIDE_URL = "https://hindihealthguide.org";

  useEffect(() => {
    // दिनांक और तारीख का ऑटोमेशन
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(now.toLocaleDateString("hi-IN", options));
  }, []);

  useEffect(() => {
    setInternalSearch(searchQuery);
  }, [searchQuery]);

  const changeFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(Math.max(prev + delta, 90), 120);
      if (typeof document !== 'undefined') {
        document.documentElement.style.fontSize = `${(next / 100) * 16}px`;
      }
      return next;
    });
  };

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  const handleHomeClick = () => {
    if (onBackToHome) {
      onBackToHome();
    } else if (onSelectCategory) {
      onSelectCategory('all');
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  return (
    <header className="w-full bg-white shadow-md font-sans transition-all">
      {/* ========================================================= */}
      {/* 1. बीच की सफ़ेद पट्टी (Middle White Strip - Logo Beside Title & Motto) */}
      {/* ========================================================= */}
      <div className="w-full border-b border-gray-200 py-2 sm:py-4 px-2 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Link 
            href="/" 
            onClick={(e) => {
              if (onBackToHome) {
                e.preventDefault();
                handleHomeClick();
              }
            }}
            className="flex flex-row flex-nowrap items-center gap-2 sm:gap-4 md:gap-5 group cursor-pointer select-none max-w-full"
          >
            {/* ब्रांड लोगो - नाम के बगल में (Auto-compressed on Mobile) */}
            <img
              src={LOGO_URL}
              alt="DDN Prime News Logo"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
              }}
              className="h-12 w-12 xs:h-14 xs:w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 object-contain shrink-0 transition-transform group-hover:scale-105 drop-shadow-xs"
            />

            {/* चैनल का नाम एवं सबटाइटल - नाम ऊपर, सबटाइटल ठीक नीचे */}
            <div className="flex flex-col justify-center text-left min-w-0">
              <h1 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight font-serif leading-none whitespace-nowrap bg-gradient-to-r from-red-950 via-red-800 to-red-600 bg-clip-text text-transparent">
                DDN PRIME NEWS
              </h1>
              <p className="text-[10px] xs:text-xs sm:text-base md:text-lg font-bold text-black tracking-wide mt-0.5 sm:mt-1.5 leading-tight whitespace-nowrap">
                सच्ची निर्भीक और निष्पक्ष पत्रकारिता
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. महरून पट्टी (Maroon Strip - Main Navigation Bar)       */}
      {/* ========================================================= */}
      <nav className="w-full bg-[#800000] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-[100vw] mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between min-h-[50px] py-1 gap-2">
            
            {/* कोने में दिनांक एवं तारीख का बॉक्स */}
            <div className="hidden lg:flex items-center bg-[#600000] px-3 py-1 rounded text-xs font-medium border border-red-900/40 text-amber-100">
              <span>{currentDate || "रविवार, 25 अक्टूबर 2026"}</span>
            </div>

            {/* नेविगेशन लिंक्स (Auto Fit & Compressed on Mobile) */}
            <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar py-1 text-sm font-semibold whitespace-nowrap">
              <Link 
                href="/" 
                onClick={(e) => {
                  if (onBackToHome || onSelectCategory) {
                    e.preventDefault();
                    handleHomeClick();
                  }
                }}
                className="px-2 py-1 rounded hover:bg-red-900 transition"
              >
                होम
              </Link>

              <Link 
                href="/bihar" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('bihar');
                  }
                }}
                className="px-2 py-1 rounded hover:bg-red-900 transition"
              >
                बिहार
              </Link>

              <Link 
                href="/desh" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('national');
                  }
                }}
                className="px-2 py-1 rounded hover:bg-red-900 transition"
              >
                देश
              </Link>

              <Link 
                href="/rajneeti" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('politics');
                  }
                }}
                className="px-2 py-1 rounded hover:bg-red-900 transition"
              >
                राजनीति
              </Link>

              <Link 
                href="/apradh" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('crime');
                  }
                }}
                className="px-2 py-1 rounded hover:bg-red-900 transition"
              >
                अपराध
              </Link>

              <Link 
                href="/khel" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('sports');
                  }
                }}
                className="px-2 py-1 rounded hover:bg-red-900 transition"
              >
                खेल
              </Link>

              <Link 
                href="/manoranjan" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('entertainment');
                  }
                }}
                className="px-2 py-1 rounded hover:bg-red-900 transition"
              >
                मनोरंजन
              </Link>
              
              {/* हेल्थ गाइड (अपडेटेड सही URL के साथ) */}
              <a 
                href={HEALTH_GUIDE_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white transition font-bold"
              >
                हेल्थ गाइड
              </a>

              {/* लाइव बुलेटिन */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenLiveVideo) onOpenLiveVideo();
                }}
                className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-bold animate-pulse hover:bg-red-700 transition cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>लाइव बुलेटिन</span>
              </button>

              {/* ई-पेपर */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenEPaper) onOpenEPaper();
                }}
                className="flex items-center gap-1 px-2 py-1 bg-white text-[#800000] rounded text-xs font-bold hover:bg-gray-100 transition cursor-pointer"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>ई-पेपर</span>
              </button>
            </div>

            {/* दायें कोने के फीचर्स: टेक्स्ट साइज रिसाइज़र और सर्च बार */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* टेक्स्ट रिसाइज़र */}
              <div className="hidden sm:flex items-center bg-[#600000] rounded px-1.5 py-0.5 border border-red-900/30 text-xs">
                <button 
                  type="button"
                  onClick={() => changeFontSize(-5)} 
                  className="px-1.5 py-0.5 hover:text-amber-300 font-bold cursor-pointer"
                  title="अक्षर छोटा करें"
                >
                  A-
                </button>
                <span className="text-gray-400">|</span>
                <button 
                  type="button"
                  onClick={() => changeFontSize(5)} 
                  className="px-1.5 py-0.5 hover:text-amber-300 font-bold cursor-pointer"
                  title="अक्षर बड़ा करें"
                >
                  A+
                </button>
              </div>

              {/* सर्च इनपुट कॉर्नर */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={internalSearch}
                  onChange={handleSearchInput}
                  placeholder="खोजें..."
                  className="w-24 sm:w-36 bg-[#600000] text-white placeholder-gray-300 text-xs rounded-full py-1 pl-3 pr-7 focus:outline-none focus:ring-1 focus:ring-amber-400 border border-red-900/50"
                />
                <Search className="w-3.5 h-3.5 text-gray-300 absolute right-2 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </nav>
    </header>
  );
}

export { Header };
