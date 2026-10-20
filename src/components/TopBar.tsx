'use client';

import React from 'react';
import { WeatherData } from '../types/news';
import { CloudSun, UserCheck, Type, LogIn } from 'lucide-react';

interface TopBarProps {
  currentDate: string;
  weatherList: WeatherData[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onOpenReporterModal: () => void;
  onOpenAdminDesk?: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onCycleFontSize: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentDate,
  weatherList,
  selectedCity,
  onSelectCity,
  onOpenReporterModal,
  onOpenAdminDesk,
  fontSize,
  onCycleFontSize,
}) => {
  return (
    <div className="bg-red-700 text-white text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 border-b border-red-800 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
        {/* Left: Date & Live Weather */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto whitespace-nowrap py-0.5 scrollbar-none">
          <span className="font-semibold tracking-wide flex items-center gap-1.5 text-stone-100 text-[11px] sm:text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
            {currentDate}
          </span>
          <span className="text-red-300 hidden sm:inline">|</span>

          {/* District Weather Ticker */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-red-100 text-[11px] sm:text-xs">
            <CloudSun className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            {weatherList.map((w) => (
              <button
                key={w.city}
                onClick={() => onSelectCity(w.city)}
                className={`hover:text-yellow-300 transition-colors cursor-pointer ${
                  selectedCity === w.city ? 'font-bold text-white underline decoration-yellow-400' : 'text-red-100'
                }`}
                title={`AQI: ${w.aqi} · ${w.condition}`}
              >
                {w.city} <span className="tabular-nums font-semibold text-white">{w.temp}°C</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Reporter Application, Login & Accessibility Font Controls (Visible on Mobile & Desktop) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 ml-auto">
          {/* Font Resizer */}
          <button
            onClick={onCycleFontSize}
            className="flex items-center gap-1 px-2 py-1 bg-red-800/90 hover:bg-red-900 rounded text-[11px] transition border border-red-600 text-white cursor-pointer active:scale-95"
            title="फॉन्ट आकार बदलें (A- / A+)"
          >
            <Type className="w-3 h-3 text-yellow-300" />
            <span className="font-mono hidden sm:inline">
              {fontSize === 'normal' ? 'अ' : fontSize === 'large' ? 'अ+' : 'अ++'}
            </span>
          </button>

          {/* Reporter Application Button */}
          <button
            onClick={onOpenReporterModal}
            className="bg-yellow-400 hover:bg-yellow-300 text-red-950 font-bold px-2.5 py-1 rounded shadow-sm hover:shadow transition-all flex items-center gap-1 text-[11px] sm:text-xs cursor-pointer active:scale-95"
            title="जिला व प्रखंड संवाददाता आवेदन"
          >
            <UserCheck className="w-3.5 h-3.5 text-red-950" />
            <span>रिपोर्टर आवेदन</span>
          </button>

          {/* Reporting / Editor Login Button */}
          {onOpenAdminDesk && (
            <button
              onClick={onOpenAdminDesk}
              className="bg-stone-900 hover:bg-black text-white font-semibold px-2.5 py-1 rounded shadow-sm hover:shadow transition-all flex items-center gap-1 text-[11px] sm:text-xs border border-stone-700 cursor-pointer active:scale-95"
              title="संपादकीय डेस्क / रिपोर्टर लॉगिन"
            >
              <LogIn className="w-3.5 h-3.5 text-yellow-400" />
              <span>रिपोर्टिंग लॉगिन</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
