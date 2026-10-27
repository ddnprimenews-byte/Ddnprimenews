"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Radio, Newspaper, ChevronDown, Building2, Globe, X, Check, MapPin } from "lucide-react";
import { BIHAR_DISTRICTS, INDIA_STATES } from "../data/locationsData";

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

  // बिहार के 38 जिले एवं देश के राज्यों के मोडल/ड्रॉवर की स्थिति
  const [showBiharModal, setShowBiharModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [districtFilter, setDistrictFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [activeDistrictName, setActiveDistrictName] = useState("");
  const [activeStateName, setActiveStateName] = useState("");

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
    setShowBiharModal(false);
    setShowStateModal(false);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  const handleHomeClick = () => {
    setShowBiharModal(false);
    setShowStateModal(false);
    setActiveDistrictName("");
    setActiveStateName("");
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

  // बिहार का विशिष्ट जिला चुनने पर
  const handleSelectBiharDistrict = (districtNameHindi: string) => {
    setActiveDistrictName(districtNameHindi === "समग्र बिहार" ? "" : districtNameHindi);
    setActiveStateName("");
    setShowBiharModal(false);
    if (onSelectCategory) {
      onSelectCategory('bihar');
    }
    if (onSearchChange) {
      onSearchChange(districtNameHindi === "समग्र बिहार" ? "" : districtNameHindi);
    }
    if (typeof window !== "undefined") {
      const el = document.getElementById("news-main-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // देश का विशिष्ट राज्य चुनने पर
  const handleSelectIndianState = (stateNameHindi: string) => {
    setActiveStateName(stateNameHindi === "समग्र देश" ? "" : stateNameHindi);
    setActiveDistrictName("");
    setShowStateModal(false);
    if (onSelectCategory) {
      onSelectCategory('national');
    }
    if (onSearchChange) {
      onSearchChange(stateNameHindi === "समग्र देश" ? "" : stateNameHindi);
    }
    if (typeof window !== "undefined") {
      const el = document.getElementById("news-main-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
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

            {/* चैनल का नाम एवं सबटाइटल - नाम ऊपर, सबटाइटल नाम के बिल्कुल सेंटर में */}
            <div className="flex flex-col items-center justify-center text-center min-w-0">
              <h1 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight font-serif leading-none whitespace-nowrap bg-gradient-to-r from-red-950 via-red-900 to-red-800 bg-clip-text text-transparent drop-shadow-xs">
                DDN PRIME NEWS
              </h1>
              <p className="text-[10px] xs:text-xs sm:text-base md:text-lg font-bold text-black tracking-wide mt-0.5 sm:mt-1.5 leading-tight whitespace-nowrap text-center">
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
          <div className="flex flex-wrap items-center justify-between min-h-[48px] py-1 gap-2">
            
            {/* कोने में दिनांक एवं तारीख का बॉक्स */}
            <div className="hidden xl:flex items-center bg-[#540000] px-2.5 py-1 rounded text-xs font-semibold border border-red-900/50 text-amber-100">
              <span>{currentDate || "रविवार, 25 अक्टूबर 2026"}</span>
            </div>

            {/* नेविगेशन लिंक्स (Bold, High-Visibility, Auto-fit) */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar py-1 text-sm whitespace-nowrap">
              {/* होम */}
              <Link 
                href="/" 
                onClick={(e) => {
                  if (onBackToHome || onSelectCategory) {
                    e.preventDefault();
                    handleHomeClick();
                  }
                }}
                className="px-2.5 py-1 rounded font-black text-sm sm:text-[15px] tracking-wide hover:bg-[#a00000] hover:text-amber-200 transition"
              >
                होम
              </Link>

              {/* बिहार (टच करने पर सभी 38 जिले खुलेंगे) */}
              <button 
                type="button"
                onClick={() => {
                  setShowBiharModal((prev) => !prev);
                  setShowStateModal(false);
                }}
                className={`px-2.5 py-1 rounded font-black text-sm sm:text-[15px] tracking-wide transition flex items-center gap-1 cursor-pointer ${
                  showBiharModal || activeDistrictName 
                    ? "bg-[#540000] text-amber-300 ring-1 ring-amber-400/80 shadow-inner" 
                    : "hover:bg-[#a00000] hover:text-amber-200 text-white"
                }`}
                title="बिहार के सभी 38 जिले देखें"
              >
                <span>{activeDistrictName ? `बिहार (${activeDistrictName})` : "बिहार"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showBiharModal ? "rotate-180 text-amber-300" : ""}`} />
              </button>

              {/* देश (टच करने पर सभी राज्य खुलेंगे) */}
              <button 
                type="button"
                onClick={() => {
                  setShowStateModal((prev) => !prev);
                  setShowBiharModal(false);
                }}
                className={`px-2.5 py-1 rounded font-black text-sm sm:text-[15px] tracking-wide transition flex items-center gap-1 cursor-pointer ${
                  showStateModal || activeStateName 
                    ? "bg-[#540000] text-amber-300 ring-1 ring-amber-400/80 shadow-inner" 
                    : "hover:bg-[#a00000] hover:text-amber-200 text-white"
                }`}
                title="देश के सभी राज्य एवं केंद्रशासित प्रदेश देखें"
              >
                <span>{activeStateName ? `देश (${activeStateName})` : "देश"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showStateModal ? "rotate-180 text-amber-300" : ""}`} />
              </button>

              {/* राजनीति */}
              <Link 
                href="/rajneeti" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('politics');
                  }
                }}
                className="px-2.5 py-1 rounded font-black text-sm sm:text-[15px] tracking-wide hover:bg-[#a00000] hover:text-amber-200 transition"
              >
                राजनीति
              </Link>

              {/* अपराध */}
              <Link 
                href="/apradh" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('crime');
                  }
                }}
                className="px-2.5 py-1 rounded font-black text-sm sm:text-[15px] tracking-wide hover:bg-[#a00000] hover:text-amber-200 transition"
              >
                अपराध
              </Link>

              {/* खेल */}
              <Link 
                href="/khel" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('sports');
                  }
                }}
                className="px-2.5 py-1 rounded font-black text-sm sm:text-[15px] tracking-wide hover:bg-[#a00000] hover:text-amber-200 transition"
              >
                खेल
              </Link>

              {/* मनोरंजन */}
              <Link 
                href="/manoranjan" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick('entertainment');
                  }
                }}
                className="px-2.5 py-1 rounded font-black text-sm sm:text-[15px] tracking-wide hover:bg-[#a00000] hover:text-amber-200 transition"
              >
                मनोरंजन
              </Link>
              
              {/* हेल्थ गाइड */}
              <a 
                href={HEALTH_GUIDE_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white transition font-black text-xs sm:text-sm shadow-xs"
              >
                हेल्थ गाइड
              </a>

              {/* लाइव बुलेटिन */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenLiveVideo) onOpenLiveVideo();
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded text-xs font-black animate-pulse hover:bg-red-700 transition cursor-pointer"
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
                className="flex items-center gap-1 px-2.5 py-1 bg-white text-[#800000] rounded text-xs font-black hover:bg-amber-50 transition cursor-pointer shadow-xs"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>ई-पेपर</span>
              </button>
            </div>

            {/* दायें कोने के फीचर्स: कॉम्पैक्ट टेक्स्ट साइज रिसाइज़र और कॉम्पैक्ट सर्च बार */}
            <div className="flex items-center space-x-1.5 ml-auto shrink-0">
              {/* छोटा किया हुआ टेक्स्ट रिसाइज़र */}
              <div className="hidden sm:inline-flex items-center bg-[#540000] rounded px-1.5 py-0.5 border border-red-900/50 text-[11px] gap-0.5">
                <button 
                  type="button"
                  onClick={() => changeFontSize(-5)} 
                  className="px-1 hover:text-amber-300 font-black cursor-pointer leading-none"
                  title="अक्षर छोटा करें"
                >
                  A-
                </button>
                <span className="text-red-400/50 text-[10px]">|</span>
                <button 
                  type="button"
                  onClick={() => changeFontSize(5)} 
                  className="px-1 hover:text-amber-300 font-black cursor-pointer leading-none"
                  title="अक्षर बड़ा करें"
                >
                  A+
                </button>
              </div>

              {/* छोटा किया हुआ सर्च इनपुट */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={internalSearch}
                  onChange={handleSearchInput}
                  placeholder="खोजें..."
                  className="w-20 sm:w-28 focus:w-36 transition-all duration-200 bg-[#540000] text-white placeholder-gray-300 text-xs rounded-full py-0.5 pl-2.5 pr-6 focus:outline-none focus:ring-1 focus:ring-amber-400 border border-red-900/50"
                />
                <Search className="w-3 h-3 text-gray-300 absolute right-2 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* बिहार के सभी 38 जिले (Interactive Dropdown Drawer)       */}
        {/* ========================================================= */}
        {showBiharModal && (
          <div className="w-full bg-stone-900 text-white border-t-2 border-red-600 shadow-2xl py-4 px-3 sm:px-6 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            <div className="max-w-7xl mx-auto space-y-3.5">
              {/* शीर्ष हेडर एवं सर्च बार */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-900/80 flex items-center justify-center text-amber-300 border border-red-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black font-serif text-white">
                      बिहार के सभी 38 जिले (DDN Prime News नेटवर्क)
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-300">
                      अपना जिला चुनें और सीधे अपने जिले की ग्राउंड रिपोर्ट व ब्रेकिंग न्यूज़ पढ़ें
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* जिला खोजें इनपुट */}
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={districtFilter}
                      onChange={(e) => setDistrictFilter(e.target.value)}
                      placeholder="जिला खोजें (उदा. दरभंगा, पटना, गया)..."
                      className="w-full px-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-stone-400"
                    />
                    {districtFilter && (
                      <button
                        type="button"
                        onClick={() => setDistrictFilter("")}
                        className="absolute right-2.5 top-2 text-stone-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* समग्र बिहार बटन */}
                  <button
                    type="button"
                    onClick={() => handleSelectBiharDistrict("समग्र बिहार")}
                    className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-black transition whitespace-nowrap cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>समग्र बिहार (सभी 38 जिले)</span>
                  </button>

                  {/* बंद करें बटन */}
                  <button
                    type="button"
                    onClick={() => setShowBiharModal(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
                    title="बंद करें"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 38 जिलों की सूची (Responsive Tap Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-72 overflow-y-auto pr-1">
                {BIHAR_DISTRICTS
                  .filter((d) => 
                    !districtFilter.trim() || 
                    d.nameHindi.toLowerCase().includes(districtFilter.toLowerCase()) ||
                    d.nameEnglish.toLowerCase().includes(districtFilter.toLowerCase()) ||
                    (d.division && d.division.toLowerCase().includes(districtFilter.toLowerCase()))
                  )
                  .map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectBiharDistrict(d.nameHindi)}
                      className={`text-left px-2.5 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                        activeDistrictName === d.nameHindi
                          ? "bg-red-700 text-white border-red-500 shadow-md ring-1 ring-amber-400"
                          : "bg-stone-950/80 hover:bg-red-900/80 text-stone-200 border-stone-800 hover:border-red-600"
                      }`}
                    >
                      <span className="truncate">{d.nameHindi}</span>
                      {d.division === "दरभंगा" && (
                        <span className="text-[9px] px-1 rounded bg-amber-900/60 text-amber-200 border border-amber-600 ml-1 shrink-0 font-medium">
                          मिथिला
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* देश के सभी राज्य एवं केंद्रशासित प्रदेश (Interactive Dropdown Drawer) */}
        {/* ========================================================= */}
        {showStateModal && (
          <div className="w-full bg-stone-900 text-white border-t-2 border-red-600 shadow-2xl py-4 px-3 sm:px-6 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            <div className="max-w-7xl mx-auto space-y-3.5">
              {/* शीर्ष हेडर एवं सर्च बार */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-900/80 flex items-center justify-center text-amber-300 border border-red-700">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black font-serif text-white">
                      देश के सभी 28 राज्य एवं 8 केंद्रशासित प्रदेश
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-300">
                      अपना राज्य चुनें और राष्ट्रीय स्तर की सभी प्रमुख घटनाएं व नीतिगत फैसले पढ़ें
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* राज्य खोजें इनपुट */}
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      placeholder="राज्य खोजें (उदा. उत्तर प्रदेश, दिल्ली, महाराष्ट्र)..."
                      className="w-full px-3 py-1.5 text-xs bg-stone-950 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-stone-400"
                    />
                    {stateFilter && (
                      <button
                        type="button"
                        onClick={() => setStateFilter("")}
                        className="absolute right-2.5 top-2 text-stone-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* समग्र देश बटन */}
                  <button
                    type="button"
                    onClick={() => handleSelectIndianState("समग्र देश")}
                    className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-black transition whitespace-nowrap cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>समग्र देश (राष्ट्रीय समाचार)</span>
                  </button>

                  {/* बंद करें बटन */}
                  <button
                    type="button"
                    onClick={() => setShowStateModal(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
                    title="बंद करें"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* राज्यों की सूची (Responsive Tap Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 max-h-72 overflow-y-auto pr-1">
                {INDIA_STATES
                  .filter((s) => 
                    !stateFilter.trim() || 
                    s.nameHindi.toLowerCase().includes(stateFilter.toLowerCase()) ||
                    s.nameEnglish.toLowerCase().includes(stateFilter.toLowerCase())
                  )
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectIndianState(s.nameHindi)}
                      className={`text-left px-2.5 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                        activeStateName === s.nameHindi
                          ? "bg-red-700 text-white border-red-500 shadow-md ring-1 ring-amber-400"
                          : "bg-stone-950/80 hover:bg-red-900/80 text-stone-200 border-stone-800 hover:border-red-600"
                      }`}
                    >
                      <span className="truncate">{s.nameHindi}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export { Header };
