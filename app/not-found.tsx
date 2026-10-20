import React from 'react';
import Link from 'next/link';
import { Newspaper, Home, ArrowLeft, Search } from 'lucide-react';
import { SITE_CONFIG } from '@/src/config/site';

/**
 * 404 Not Found Page for DDN Prime News
 * Provides graceful fallback navigation to prevent broken links
 */
export default function NotFound() {
  const popularCategories = [
    { label: 'बिहार विशेष', href: '/?category=bihar' },
    { label: 'देश', href: '/?category=national' },
    { label: 'राजनीति', href: '/?category=politics' },
    { label: 'अपराध', href: '/?category=crime' },
    { label: 'शिक्षा & हेल्थ', href: '/?category=education-health' },
    { label: 'खेल जगत', href: '/?category=sports' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden text-center">
        {/* Header Ribbon */}
        <div className="bg-[#800000] text-white p-6 sm:p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900 mb-3 border border-red-700">
            <Newspaper className="w-8 h-8 text-yellow-300" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-yellow-300 uppercase block mb-1">
            त्रुटि 404 · Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
            समाचार पृष्ठ उपलब्ध नहीं है
          </h1>
          <p className="text-xs text-red-200 mt-1 font-hindi">
            {SITE_CONFIG.organization}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 text-stone-700">
          <p className="text-xs sm:text-sm leading-relaxed text-stone-600">
            आप जिस समाचार लेख, श्रेणी या पृष्ठ को खोज रहे हैं, उसका लिंक परिवर्तित हो गया है अथवा उसे हटा दिया गया है।
          </p>

          {/* Quick Category Links */}
          <div className="space-y-2 text-left bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              प्रमुख समाचार श्रेणियां देखें:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {popularCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="px-2.5 py-1 bg-white hover:bg-red-50 text-stone-800 hover:text-red-700 text-xs font-semibold rounded-md border border-stone-200 transition"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg transition shadow-md text-sm active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>डीडीएन प्राइम न्यूज मुख्य पोर्टल पर लौटें</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
