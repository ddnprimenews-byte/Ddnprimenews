'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert, Phone, Mail } from 'lucide-react';
import { SITE_CONFIG } from '@/src/config/site';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Production-Grade Global Error Boundary for DDN Prime News
 * Prevents portal crashes by presenting a graceful Hindi/English recovery interface
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to reporting service in production
    console.error('DDN Prime News Portal Error Caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Brand Banner */}
        <div className="bg-[#800000] text-white p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-900/80 mb-3 border border-red-700">
            <ShieldAlert className="w-8 h-8 text-yellow-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif">
            तकनीकी समस्या (Temporary Issue)
          </h1>
          <p className="text-xs sm:text-sm text-red-200 mt-1 font-hindi">
            {SITE_CONFIG.organization}
          </p>
        </div>

        {/* Error Details & Guidance */}
        <div className="p-6 sm:p-8 space-y-5 text-stone-800">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs sm:text-sm text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">पृष्ठ लोड करते समय अप्रत्याशित त्रुटि उत्पन्न हुई।</p>
              <p className="text-stone-600 mt-1 text-xs">
                चिंता न करें, हमारा तकनीकी डेस्क इस समस्या पर नजर बनाए हुए है। कृपया पुनः प्रयास करें।
              </p>
              {error.digest && (
                <p className="mt-2 text-[10px] font-mono text-stone-400">
                  त्रुटि संदर्भ कोड: {error.digest}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full sm:w-1/2 py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>पुनः प्रयास करें (Retry)</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-1/2 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg transition border border-stone-300 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>होमपेज पर जाएं</span>
            </Link>
          </div>

          {/* Emergency Editorial Helpline */}
          <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500 space-y-1.5">
            <p className="font-semibold text-stone-700">संपादकीय एवं तकनीकी सहायता:</p>
            <div className="flex items-center justify-center gap-4 text-[11px]">
              <a
                href={`tel:${SITE_CONFIG.editorial.phone}`}
                className="flex items-center gap-1 text-red-700 hover:underline"
              >
                <Phone className="w-3 h-3" />
                <span>{SITE_CONFIG.editorial.phone}</span>
              </a>
              <span>·</span>
              <a
                href={`mailto:${SITE_CONFIG.editorial.email}`}
                className="flex items-center gap-1 text-red-700 hover:underline"
              >
                <Mail className="w-3 h-3" />
                <span>{SITE_CONFIG.editorial.email}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
