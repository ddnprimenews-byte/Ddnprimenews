"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, Phone, MapPin, ExternalLink, 
  Scale, Lock, FileText, UserCheck, Newspaper, Radio,
  MessageSquare, Mail
} from "lucide-react";
import { NewsCategory, LegalPageType } from "../types/news";

interface FooterProps {
  onOpenReporterModal?: () => void;
  onOpenReporterLogin?: () => void;
  onOpenEPaper?: () => void;
  onOpenLiveVideo?: () => void;
  onSelectCategory?: (cat: NewsCategory) => void;
  onSelectLegalPage?: (page: LegalPageType) => void;
  onOpenAdminDesk?: () => void;
}

export default function Footer({
  onOpenReporterModal,
  onOpenReporterLogin,
  onOpenEPaper,
  onOpenLiveVideo,
  onSelectCategory,
  onSelectLegalPage,
  onOpenAdminDesk,
}: FooterProps) {
  const LOGO_URL = "/logo.png";
  const FALLBACK_LOGO = "https://i.ibb.co/VY9xs9J3/file-0000000042f88211ae847c19f18a28c0.png";
  const HEALTH_GUIDE_URL = "https://hindihealthguide.org";

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (cat: NewsCategory) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    scrollToTop();
  };

  const handleLegalClick = (page: LegalPageType) => {
    if (onSelectLegalPage) {
      onSelectLegalPage(page);
    }
    scrollToTop();
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-10 pb-10 border-t-4 border-[#800000] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Clean Brand & Mission Banner (No Subscription Box) */}
        <div className="pb-8 border-b border-stone-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-3.5">
              <Link 
                href="/" 
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.preventDefault();
                    handleCategoryClick("all");
                  }
                }}
                className="inline-block group cursor-pointer shrink-0"
              >
                <img
                  src={LOGO_URL}
                  alt="DDN Prime News Logo"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
                  }}
                  className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-white">
                  DDN PRIME NEWS
                </h2>
                <p className="text-xs sm:text-sm text-red-500 font-bold">
                  सच्ची निर्भीक और निष्पक्ष पत्रकारिता
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-xl">
              दरभंगा डिजिटल नेटवर्क (DDN Prime News) — उत्तर बिहार एवं मिथिलांचल की प्रामाणिक, निर्भीक और निष्पक्ष डिजिटल पत्रकारिता इकाई। ग्रामीण, कस्बाई एवं राष्ट्रीय घटनाओं की त्वरित और सत्यनिष्ठ रिपोर्टिंग।
            </p>

            {/* MSME Official Registration Badge */}
            <div className="inline-flex items-center gap-2 bg-stone-900 border border-stone-700/80 px-3.5 py-2 rounded-lg text-xs text-amber-300 shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>भारत सरकार MSME पंजीकृत: <strong className="text-white font-mono">UDYAM-BR-09-0028491</strong></span>
            </div>
          </div>
        </div>

        {/* Middle Row: Editorial Office, Categories, and Legal Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-b border-stone-800 text-xs">
          
          {/* 1. संपादकीय एवं प्रशासनिक कार्यालय */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif border-b border-red-800/60 pb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>संपादकीय कार्यालय</span>
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li className="flex items-start gap-2">
                <span className="text-white font-semibold shrink-0">प्रधान संपादक:</span>
                <span className="text-stone-300">राजेश कुमार साहू</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white font-semibold shrink-0">कार्यालय पता:</span>
                <span>वार्ड नंबर 9, पैगंबरपुर, पोस्ट- दरमा, थाना- क्यूटी, जिला- दरभंगा, बिहार - 847121</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-red-400 shrink-0" />
                <a href="tel:+919341050287" className="text-stone-300 hover:text-white transition font-mono">
                  +91 9341050287
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-red-400 shrink-0" />
                <a href="mailto:ddnprimenews@gmail.com" className="text-stone-300 hover:text-white transition">
                  ddnprimenews@gmail.com
                </a>
              </li>
              <li className="pt-1 text-[11px] text-amber-400/90 border-t border-stone-800/80">
                <strong>शिकायत निवारण अधिकारी:</strong> राजेश कुमार साहू
              </li>
            </ul>
          </div>

          {/* 2. प्रमुख समाचार श्रेणियां */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif border-b border-red-800/60 pb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span>प्रमुख श्रेणियां</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-stone-400">
              <button
                type="button"
                onClick={() => handleCategoryClick("bihar")}
                className="text-left hover:text-white transition cursor-pointer"
              >
                • बिहार समाचार
              </button>
              <button
                type="button"
                onClick={() => handleCategoryClick("national")}
                className="text-left hover:text-white transition cursor-pointer"
              >
                • देश (National)
              </button>
              <button
                type="button"
                onClick={() => handleCategoryClick("politics")}
                className="text-left hover:text-white transition cursor-pointer"
              >
                • राजनीति
              </button>
              <button
                type="button"
                onClick={() => handleCategoryClick("crime")}
                className="text-left hover:text-white transition cursor-pointer"
              >
                • अपराध (Crime)
              </button>
              <button
                type="button"
                onClick={() => handleCategoryClick("sports")}
                className="text-left hover:text-white transition cursor-pointer"
              >
                • खेल जगत
              </button>
              <button
                type="button"
                onClick={() => handleCategoryClick("entertainment")}
                className="text-left hover:text-white transition cursor-pointer"
              >
                • मनोरंजन
              </button>
              <button
                type="button"
                onClick={() => handleCategoryClick("team")}
                className="text-left hover:text-white transition cursor-pointer"
              >
                • हमारी टीम
              </button>
              <a
                href={HEALTH_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-left text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
              >
                • हेल्थ गाइड
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* 3. डिजिटल सेवाएं एवं Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif border-b border-red-800/60 pb-1.5 flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-red-500" />
              <span>डिजिटल सेवाएं</span>
            </h4>
            <ul className="space-y-2 text-stone-400">
              {onOpenEPaper && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenEPaper}
                    className="hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Newspaper className="w-3 h-3 text-red-400" />
                    <span>आज का डिजिटल ई-पेपर (E-Paper)</span>
                  </button>
                </li>
              )}
              {onOpenLiveVideo && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenLiveVideo}
                    className="hover:text-white transition flex items-center gap-1.5 cursor-pointer text-red-400 font-semibold"
                  >
                    <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                    <span>लाइव वीडियो बुलेटिन्स (Live News)</span>
                  </button>
                </li>
              )}
              {/* 1. संपादक एवं एडमिन लॉगिन */}
              {onOpenAdminDesk && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenAdminDesk}
                    className="hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer text-stone-300 text-xs font-semibold"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>संपादक एवं एडमिन लॉगिन (Admin Desk)</span>
                  </button>
                </li>
              )}

              {/* 2. रिपोर्टर लॉगिन */}
              {onOpenReporterLogin && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenReporterLogin}
                    className="hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer text-amber-400 text-xs font-bold"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>रिपोर्टर लॉगिन (Reporter Portal)</span>
                  </button>
                </li>
              )}

              {/* 3. रिपोर्टर आवेदन */}
              {onOpenReporterModal && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenReporterModal}
                    className="hover:text-white transition flex items-center gap-1.5 cursor-pointer text-stone-300 text-xs font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                    <span>रिपोर्टर आवेदन (पत्रकार भर्ती 2026)</span>
                  </button>
                </li>
              )}
              <li className="pt-1">
                <a
                  href="https://api.whatsapp.com/send?phone=919341050287"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp पर खबर भेजें: 9341050287</span>
                </a>
              </li>
            </ul>
          </div>

          {/* 4. नीति एवं नियम (Legal & Ethics Compliance) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif border-b border-red-800/60 pb-1.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-red-500" />
              <span>नीति एवं नियम</span>
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleLegalClick("about")}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  • हमारे बारे में (About Us)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLegalClick("privacy")}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  • गोपनीयता नीति (Privacy Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLegalClick("terms")}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  • नियम एवं शर्तें (Terms & Conditions)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLegalClick("editorial")}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  • संपादकीय नीति एवं तथ्य-जांच (Editorial Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLegalClick("corrections")}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  • शिकायत निवारण तंत्र (Grievance Redressal)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLegalClick("contact")}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  • विज्ञापन एवं संपर्क (Advertise With Us)
                </button>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 text-stone-400 transition flex items-center gap-1"
                >
                  • साइटमैप (XML Sitemap)
                  <ExternalLink className="w-2.5 h-2.5 text-amber-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Row in Footer: Simple Copyright & Official Domain */}
        <div className="pt-6 border-t border-stone-800/80 text-center text-xs text-stone-400">
          <p>
            © {new Date().getFullYear()} <strong>DDN Prime News (दरभंगा डिजिटल नेटवर्क)</strong>. सर्वाधिकार सुरक्षित | आधिकारिक डोमेन: <a href="https://ddnprimenews.com" className="text-stone-300 hover:text-white font-mono">ddnprimenews.com</a>
          </p>
        </div>

      </div>
    </footer>
  );
}

export { Footer };
