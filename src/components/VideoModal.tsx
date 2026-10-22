'use client';

import React, { useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Radio, Share2 } from 'lucide-react';
import { VideoBulletin } from '../types/news';

interface VideoModalProps {
  bulletins: VideoBulletin[];
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ bulletins, isOpen, onClose }) => {
  const [activeVideo, setActiveVideo] = useState(bulletins[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/85 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      <div className="bg-stone-950 text-white rounded-xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-stone-800 flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-stone-900 px-4 py-3 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="font-bold text-sm sm:text-base font-serif">
              डीडीएन प्राइम डिजिटल ब्रॉडकास्ट (DDN Live Bulletins)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Screen Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <img
            src={activeVideo.thumbnail || '/images/ddn_hero_news.jpg'}
            alt={activeVideo.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/ddn_hero_news.jpg';
            }}
            className="w-full h-full object-cover opacity-80"
          />

          {/* Broadcast Overlay Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE DIGITAL BROADCAST
            </span>
            <span className="bg-black/70 backdrop-blur-xs text-stone-200 text-xs px-2 py-0.5 rounded font-mono">
              दरभंगा स्टूडियो
            </span>
          </div>

          <div className="absolute top-3 right-3 bg-red-950/80 text-yellow-300 text-xs font-black px-2 py-1 rounded border border-red-800">
            DDN PRIME
          </div>

          {/* Lower Third News Ticker */}
          <div className="absolute bottom-12 left-0 right-0 bg-stone-900/90 border-t-2 border-red-600 px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-3">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0">
              हेडलाइंस
            </span>
            <span className="truncate">{activeVideo.title}</span>
          </div>

          {/* Player Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-4 py-2 flex items-center justify-between text-xs text-stone-300">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="hover:text-white transition"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-red-500" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="hover:text-white transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="font-mono text-[11px] text-stone-400">
                04:12 / {activeVideo.duration}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-stone-400">एंकर: {activeVideo.anchor}</span>
            </div>
          </div>
        </div>

        {/* Video Playlist */}
        <div className="p-4 bg-stone-900 border-t border-stone-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
            ताज़ा वीडियो बुलेटिन्स (Playlist)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bulletins.map((vid) => (
              <div
                key={vid.id}
                onClick={() => setActiveVideo(vid)}
                className={`p-2 rounded cursor-pointer transition border flex gap-2 items-center ${
                  activeVideo.id === vid.id
                    ? 'bg-stone-800 border-red-600'
                    : 'bg-stone-950/60 border-stone-800 hover:bg-stone-800'
                }`}
              >
                <div className="w-16 h-12 rounded overflow-hidden bg-stone-800 shrink-0 relative">
                  <img 
                    src={vid.thumbnail || '/images/ddn_hero_news.jpg'} 
                    alt={vid.title} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/ddn_hero_news.jpg';
                    }}
                    className="w-full h-full object-cover" 
                  />
                  <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[9px] px-1 rounded font-mono">
                    {vid.duration}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold line-clamp-2 text-stone-200">
                    {vid.title}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{vid.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
