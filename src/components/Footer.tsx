"use client";

import React from "react";
import Link from "next/link";
import { Lock, UserCheck, ShieldCheck } from "lucide-react";

interface FooterProps {
  onOpenReporterModal?: () => void;
  onOpenEPaper?: () => void;
  onSelectCategory?: (cat: any) => void;
  onSelectLegalPage?: (page: any) => void;
  onOpenAdminDesk?: () => void;
}

export default function Footer({
  onOpenReporterModal,
  onOpenEPaper,
  onSelectCategory,
  onSelectLegalPage,
  onOpenAdminDesk,
}: FooterProps) {
  const LOGO_URL = "https://ibb.co/LdRr3RYv";

  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6 border-t-4 border-[#800000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          
          {/* फुटर लोगो एवं ब्रांड नाम */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="inline-block group">
              <img
                src={LOGO_URL}
                alt="DDN Prime News Logo"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/icon.png';
                }}
                className="h-16 w-auto object-contain mb-3 transition-transform group-hover:scale-105"
              />
            </Link>
            <h2 className="text-2xl font-bold font-serif tracking-wide text-white">
              DDN PRIME NEWS
            </h2>
            <p className="text-sm text-red-500 font-semibold mt-1">
              सच्ची निर्भीक और निष्पक्ष पत्रकारिता
            </p>
          </div>

          {/* मुख्य लिंक्स */}
          <div className="flex flex-col items-center space-y-3">
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-300">
              <Link 
                href="/" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory('all');
                  }
                }}
                className="hover:text-white transition"
              >
                होम
              </Link>

              <Link 
                href="/bihar" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory('bihar');
                  }
                }}
                className="hover:text-white transition"
              >
                बिहार
              </Link>

              <Link 
                href="/desh" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory('national');
                  }
                }}
                className="hover:text-white transition"
              >
                देश
              </Link>

              <Link 
                href="/rajneeti" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory('politics');
                  }
                }}
                className="hover:text-white transition"
              >
                राजनीति
              </Link>

              <a 
                href="https://hindihealthguide.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-amber-400 transition"
              >
                हेल्थ गाइड
              </a>

              <Link 
                href="/team" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    onSelectCategory('team');
                  }
                }}
                className="hover:text-white transition"
              >
                हमारी टीम
              </Link>
            </div>

            {/* Quick Actions (पत्रकार आवेदन, ई-पेपर, एडमिन) */}
            <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
              {onOpenReporterModal && (
                <button
                  type="button"
                  onClick={onOpenReporterModal}
                  className="hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>पत्रकार आवेदन</span>
                </button>
              )}
              {onOpenEPaper && (
                <>
                  <span className="text-gray-600">·</span>
                  <button
                    type="button"
                    onClick={onOpenEPaper}
                    className="hover:text-amber-300 transition cursor-pointer"
                  >
                    डिजिटल ई-पेपर
                  </button>
                </>
              )}
              {onOpenAdminDesk && (
                <>
                  <span className="text-gray-600">·</span>
                  <button
                    type="button"
                    onClick={onOpenAdminDesk}
                    className="hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
                    title="संपादक डेस्क"
                  >
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>संपादक लॉगिन</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* कॉपीराइट एवं एमएसएमई पंजीकरण */}
          <div className="text-center md:text-right text-xs text-gray-400 space-y-1.5">
            <p className="flex items-center justify-center md:justify-end gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>MSME Reg: <strong className="text-gray-200 font-mono">UDYAM-BR-09-0028491</strong></span>
            </p>
            <p>© {new Date().getFullYear()} DDN Prime News. सर्वाधिकार सुरक्षित।</p>
          </div>

        </div>
      </div>
    </footer>
  );
}

export { Footer };
