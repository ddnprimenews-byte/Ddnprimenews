'use client';

import React, { useState } from 'react';
import { NewsCategory } from '../types/news';
import { ExternalLink, Menu, X, UserCheck, Lock, Newspaper } from 'lucide-react';

interface NavbarProps {
  activeCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
  onOpenEPaper: () => void;
  onOpenReporterModal: () => void;
  onOpenAdminDesk?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenEPaper,
  onOpenReporterModal,
  onOpenAdminDesk,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; cat: NewsCategory }[] = [
    { label: 'होम', cat: 'all' },
    { label: 'बिहार', cat: 'bihar' },
    { label: 'देश', cat: 'national' },
    { label: 'राजनीति', cat: 'politics' },
    { label: 'अपराध', cat: 'crime' },
    { label: 'शिक्षा & हेल्थ', cat: 'education-health' },
    { label: 'खेल', cat: 'sports' },
    { label: 'मनोरंजन', cat: 'entertainment' },
    { label: 'हमारी टीम', cat: 'team' },
  ];

  const handleNavClick = (cat: NewsCategory) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#800000] text-white shadow-md z-30 sticky top-0 md:top-[68px] border-b border-red-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between">
        {/* Horizontal Category Bar (Visible & Scrollable on BOTH Mobile and Desktop) */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto whitespace-nowrap py-2 sm:py-2.5 text-xs sm:text-sm font-semibold scrollbar-none w-full md:w-auto">
          {navItems.map((item) => {
            const isActive = activeCategory === item.cat;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.cat)}
                className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-red-950 text-yellow-300 font-extrabold shadow-inner border-b-2 border-yellow-400'
                    : 'text-stone-100 hover:text-yellow-300 hover:bg-red-900/60'
                }`}
                title={`${item.label} समाचार देखें`}
              >
                {item.label}
              </button>
            );
          })}

          {/* External Health Guide Direct Link */}
          <a
            href="https://www.hindilhealthguide.org"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-stone-200 hover:text-yellow-300 flex items-center gap-1 transition-colors whitespace-nowrap text-xs border border-red-700/60 rounded shrink-0"
            title="विजिट करें www.hindilhealthguide.org"
          >
            <span>हेल्थ गाइड</span>
            <ExternalLink className="w-3 h-3 text-yellow-400" />
          </a>

          {/* E-Paper Tab */}
          <button
            onClick={onOpenEPaper}
            className="px-2.5 py-1 text-yellow-300 hover:text-white transition-colors whitespace-nowrap font-semibold cursor-pointer shrink-0 text-xs sm:text-sm"
          >
            ई-पेपर
          </button>

          {/* Reporter Application Tab */}
          <button
            onClick={onOpenReporterModal}
            className="px-2.5 py-1 bg-yellow-400 text-red-950 hover:bg-yellow-300 rounded font-bold transition-all whitespace-nowrap text-xs cursor-pointer active:scale-95 shrink-0"
          >
            पत्रकार पंजीकरण
          </button>

          {/* Reporter / Editor Login Tab in Maroon Bar */}
          {onOpenAdminDesk && (
            <button
              onClick={onOpenAdminDesk}
              className="px-2.5 py-1 bg-stone-900 hover:bg-black text-yellow-300 rounded font-bold transition-all whitespace-nowrap text-xs cursor-pointer active:scale-95 shrink-0 border border-red-900 flex items-center gap-1"
              title="रिपोर्टिंग लॉगिन / संपादक डेस्क"
            >
              <Lock className="w-3 h-3 text-yellow-400" />
              <span>रिपोर्टिंग लॉगिन</span>
            </button>
          )}

          {/* Toggle button for extra navigation on small screens */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-stone-200 hover:text-white hover:bg-red-900 focus:outline-none cursor-pointer shrink-0 ml-1"
            aria-label="Toggle extra menu"
            title="अधिक विकल्प"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-yellow-300" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu for Quick Access */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#550000] border-t border-red-900 px-4 py-3 space-y-2 text-sm font-medium shadow-lg">
          <p className="text-xs uppercase tracking-wider text-red-300 font-bold mb-2">सभी श्रेणियां एवं सेवाएं</p>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.cat)}
                className={`py-2 px-3 rounded text-left transition cursor-pointer ${
                  activeCategory === item.cat
                    ? 'bg-red-900 text-yellow-300 font-bold border-l-4 border-yellow-400'
                    : 'text-stone-100 hover:bg-red-900/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-red-800 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEPaper();
              }}
              className="w-full flex items-center gap-2 py-2 px-3 text-yellow-300 font-bold hover:bg-red-900/60 rounded cursor-pointer"
            >
              <Newspaper className="w-4 h-4" />
              <span>दैनिक ई-पेपर संस्करण</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReporterModal();
              }}
              className="w-full flex items-center gap-2 py-2 px-3 bg-yellow-400 text-red-950 font-bold rounded cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>पत्रकार भर्ती हेतु आवेदन करें</span>
            </button>

            {onOpenAdminDesk && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminDesk();
                }}
                className="w-full flex items-center gap-2 py-2 px-3 bg-stone-900 text-white font-bold rounded cursor-pointer border border-stone-700"
              >
                <Lock className="w-4 h-4 text-yellow-400" />
                <span>संपादकीय डेस्क / रिपोर्टर लॉगिन</span>
              </button>
            )}

            <a
              href="https://www.hindilhealthguide.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-3 text-stone-200 hover:bg-red-900/60 rounded text-xs"
            >
              <span>शिक्षा & हेल्थ गाइड (hindilhealthguide.org)</span>
              <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
