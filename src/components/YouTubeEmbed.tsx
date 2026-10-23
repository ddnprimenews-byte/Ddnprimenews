'use client';

import React, { useState } from 'react';
import { Play, ExternalLink, Radio } from 'lucide-react';
import { getYouTubeEmbedInfo } from '../lib/mediaOptimization';

interface YouTubeEmbedProps {
  urlOrId: string;
  title?: string;
  autoPlayOnClick?: boolean;
  className?: string;
  customThumbnail?: string;
}

/**
 * High-Performance Lite YouTube Embed Component for DDN Prime News
 * 
 * Prevents loading ~1.2MB of unneeded YouTube iframe scripts on initial page load.
 * Displays a lightweight responsive 16:9 poster with play button, only injecting
 * the iframe when clicked.
 */
export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  urlOrId,
  title = 'डीडीएन प्राइम वीडियो बुलेटिन',
  className = '',
  customThumbnail,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  const info = getYouTubeEmbedInfo(urlOrId);

  if (!info) {
    return (
      <div className={`aspect-video w-full rounded-lg bg-stone-900 border border-stone-800 flex flex-col items-center justify-center p-4 text-center text-stone-400 ${className}`}>
        <p className="text-xs">अमान्य अथवा अनुपलब्ध वीडियो लिंक।</p>
      </div>
    );
  }

  // Use custom thumbnail, maxres, or hqdefault fallback
  const posterUrl = customThumbnail || (!imgError ? info.thumbnailMaxRes : info.thumbnailHq);

  return (
    <div className={`relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-stone-800 shadow-md ${className}`}>
      {isPlaying ? (
        <iframe
          src={info.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="w-full h-full border-0 absolute inset-0"
        />
      ) : (
        <div
          onClick={() => setIsPlaying(true)}
          className="relative w-full h-full cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsPlaying(true);
          }}
          aria-label={`वीडियो चलाएं: ${title}`}
        >
          {/* Poster Image */}
          <img
            src={posterUrl}
            alt={title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 opacity-85"
          />

          {/* Broadcast Gradient & Badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 flex flex-col justify-between p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="bg-red-700 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                DDN VIDEO
              </span>

              <a
                href={info.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded bg-black/60 text-stone-300 hover:text-white transition"
                title="YouTube पर देखें"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Big Centered Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1 fill-current" />
              </div>
            </div>

            {/* Video Headline */}
            <div className="bg-black/60 backdrop-blur-xs p-2 rounded">
              <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                {title}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
