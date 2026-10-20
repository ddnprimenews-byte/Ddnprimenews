import React from 'react';
import { SITE_CONFIG } from '../config/site';

interface AdSenseBannerProps {
  slot: 'header-leaderboard' | 'in-article' | 'sidebar-display';
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({ slot, className = '' }) => {
  if (!SITE_CONFIG.adSense.enabled) return null;

  return (
    <div
      className={`my-4 flex flex-col items-center justify-center border border-dashed border-stone-300 bg-stone-50/80 rounded p-2 text-center overflow-hidden ${className}`}
      aria-label="विज्ञापन क्षेत्र / Advertisement Block"
    >
      <div className="w-full flex items-center justify-between px-2 pb-1 text-[10px] uppercase font-mono tracking-widest text-stone-400 border-b border-stone-200/60 mb-2">
        <span>विज्ञापन / ADVERTISEMENT</span>
        <span>GOOGLE ADSENSE COMPLIANT</span>
      </div>

      {slot === 'header-leaderboard' && (
        <div className="w-full max-w-[728px] h-[90px] hidden sm:flex items-center justify-center bg-stone-100 rounded text-stone-400 text-xs font-mono">
          <span>728 × 90 Leaderboard (AdSense Slot: header_top)</span>
        </div>
      )}

      {slot === 'in-article' && (
        <div className="w-full max-w-[336px] sm:max-w-[650px] min-h-[120px] sm:min-h-[250px] flex items-center justify-center bg-stone-100 rounded text-stone-400 text-xs font-mono p-4">
          <span>उत्तर बिहार एवं मिथिलांचल विज्ञापन पार्टनर स्लॉट (Responsive In-Article Display)</span>
        </div>
      )}

      {slot === 'sidebar-display' && (
        <div className="w-full min-h-[250px] flex items-center justify-center bg-stone-100 rounded text-stone-400 text-xs font-mono p-4">
          <span>300 × 250 / 300 × 600 Medium Display (Sidebar)</span>
        </div>
      )}

      <p className="text-[9px] text-stone-400 mt-1">
        विज्ञापन सामग्री एवं कुकीज़ नीति Google AdSense मानकों के अनुरूप है।
      </p>
    </div>
  );
};
