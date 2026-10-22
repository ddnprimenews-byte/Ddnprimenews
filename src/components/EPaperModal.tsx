'use client';

import React, { useState } from 'react';
import { 
  X, Download, Printer, ZoomIn, ZoomOut, RotateCcw, 
  Calendar, ChevronLeft, ChevronRight, Newspaper 
} from 'lucide-react';

interface EPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EPaperModal: React.FC<EPaperModalProps> = ({ isOpen, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedEdition, setSelectedEdition] = useState('दरभंगा मुख्य संस्करण');
  const [pageNumber, setPageNumber] = useState(1);
  const totalPages = 8;

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 20, 180));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 20, 60));
  const handleZoomReset = () => setZoomLevel(100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/80 backdrop-blur-xs flex justify-center p-2 sm:p-4">
      <div className="bg-stone-100 rounded-xl shadow-2xl max-w-5xl w-full my-auto overflow-hidden border border-stone-300 flex flex-col h-[95vh]">
        
        {/* Top Control Bar */}
        <div className="bg-[#800000] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <Newspaper className="w-5 h-5 text-yellow-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold font-serif">
                डीडीएन प्राइम न्यूज - डिजिटल ई-पेपर (E-Paper)
              </h2>
              <p className="text-[10px] sm:text-xs text-red-200">
                दैनिक ब्रॉडशीट संस्करण · दरभंगा डिजिटल नेटवर्क
              </p>
            </div>
          </div>

          {/* Edition & Date */}
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={selectedEdition}
              onChange={(e) => setSelectedEdition(e.target.value)}
              className="bg-red-900 text-white px-2 py-1 rounded border border-red-700 text-xs focus:outline-none"
            >
              <option value="दरभंगा मुख्य संस्करण">दरभंगा मुख्य संस्करण</option>
              <option value="मधुबनी ग्रामीण संस्करण">मधुबनी ग्रामीण संस्करण</option>
              <option value="पटना व समस्तीपुर संस्करण">पटना व समस्तीपुर संस्करण</option>
            </select>

            <span className="hidden sm:inline bg-red-950/60 px-2 py-1 rounded text-stone-200 flex items-center gap-1 font-mono text-[11px]">
              <Calendar className="w-3 h-3 text-yellow-300" />
              18 अक्टूबर 2026
            </span>
          </div>

          {/* Close & Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 bg-red-800 hover:bg-red-900 rounded text-stone-200 transition"
              title="ई-पेपर प्रिंट करें"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-stone-200 hover:text-white hover:bg-red-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zoom & Page Navigation Strip */}
        <div className="bg-white border-b border-stone-200 px-4 py-2 flex items-center justify-between text-xs text-stone-700 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-stone-800">पृष्ठ {pageNumber} / {totalPages}</span>
            <div className="flex items-center space-x-1">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                className="p-1 rounded hover:bg-stone-100 disabled:opacity-40 transition"
                title="पिछला पृष्ठ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => Math.min(p + 1, totalPages))}
                className="p-1 rounded hover:bg-stone-100 disabled:opacity-40 transition"
                title="अगला पृष्ठ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-stone-100 rounded text-stone-600 transition"
              title="ज़ूम आउट"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs tabular-nums w-12 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-stone-100 rounded text-stone-600 transition"
              title="ज़ूम इन"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1 hover:bg-stone-100 rounded text-stone-600 transition"
              title="रीसेट करें"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Broadsheet Canvas Area */}
        <div className="flex-grow overflow-auto p-4 sm:p-6 flex items-start justify-center bg-stone-300">
          <div
            style={{ width: `${zoomLevel}%`, maxWidth: '960px', minWidth: '320px' }}
            className="transition-all duration-200 bg-white shadow-2xl rounded border border-stone-300 overflow-hidden"
          >
            <img
              src="/images/ddn_epaper_cover.jpg"
              alt="DDN Prime News E-Paper Broadsheet"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/ddn_hero_news.jpg';
              }}
              className="w-full h-auto block"
            />
          </div>
        </div>

        {/* Footer info strip */}
        <div className="bg-white border-t border-stone-200 px-4 py-2 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>दरभंगा डिजिटल नेटवर्क (MSME Reg.) · सर्वाधिकार सुरक्षित</span>
          <span className="font-mono">दैनिक ई-पेपर संस्करण संख्या: 2026-10-18/DBH</span>
        </div>
      </div>
    </div>
  );
};
