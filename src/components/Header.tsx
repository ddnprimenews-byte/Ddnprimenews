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

  const LOGO_URL = "https://ibb.co/LdRr3RYv";
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
      {/* 1. बीच की सफ़ेद पट्टी (Middle White Strip - Fully Centered) */}
      {/* ========================================================= */}
      <div className="w-full border-b border-gray-200 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
          {/* ब्रांड लोगो */}
          <Link 
            href="/" 
            onClick={(e) => {
              if (onBackToHome) {
                e.preventDefault();
                handleHomeClick();
              }
            }}
            className="mb-2 inline-block group"
          >
            <img
              src={LOGO_URL}
              alt="DDN Prime News Logo"
              onError={(e) => {
                // Graceful fallback to local icon if external link is restricted
                (e.currentTarget as HTMLImageElement).src = '/icon.png';
              }}
              className="h-20 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
            />
          </Link>

          {/* चैनल का नाम (Max Bold & Professional Style) */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 font-serif my-1">
            DDN PRIME NEWS
          </h1>

          {/* चैनल का मोटो */}
          <p className="text-base sm:text-lg font-bold text-red-700 mt-1">
            सच्ची निर्भीक और निष्पक्ष पत्रकारिता
          </p>
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
              
              <Link 
                href="/team" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('team');
                  }
                }}
                className="px-2 py-1 rounded hover:bg-red-900 transition"
              >
                हमारी टीम
              </Link>

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
