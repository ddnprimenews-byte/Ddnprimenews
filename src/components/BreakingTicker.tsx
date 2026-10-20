'use client';

import React, { useState, useEffect } from 'react';
import { Pause, Play, ChevronLeft, ChevronRight, BellRing } from 'lucide-react';

interface BreakingTickerProps {
  items: string[];
  onSelectBreakingItem: (text: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  items,
  onSelectBreakingItem,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, items.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="bg-red-600 text-white text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
            <BellRing className="w-3.5 h-3.5" />
            <span>ब्रेकिंग न्यूज़</span>
          </span>
        </div>

        {/* Center: Active Headline with smooth transition */}
        <div
          className="flex-grow overflow-hidden cursor-pointer"
          onClick={() => onSelectBreakingItem(items[currentIndex])}
          title="क्लिक करके पूरा पढ़ें"
        >
          <div className="text-xs sm:text-sm font-semibold text-stone-800 hover:text-red-700 transition-colors line-clamp-1 py-0.5">
            {items[currentIndex]}
          </div>
        </div>

        {/* Right: Controls (Prev, Pause/Play, Next) */}
        <div className="flex items-center space-x-1 shrink-0 text-stone-500">
          <button
            onClick={handlePrev}
            className="p-1 hover:bg-amber-200/60 rounded text-stone-700 transition"
            aria-label="Previous headline"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:bg-amber-200/60 rounded text-stone-700 transition"
            aria-label={isPlaying ? 'Pause ticker' : 'Play ticker'}
            title={isPlaying ? 'रोकें' : 'शुरू करें'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 hover:bg-amber-200/60 rounded text-stone-700 transition"
            aria-label="Next headline"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
