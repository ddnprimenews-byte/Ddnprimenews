'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { compressImageToWebp, CompressionResult } from '../lib/mediaOptimization';
import { uploadReporterPhoto } from '../lib/firebase';

interface OptimizedImageUploaderProps {
  onImageSelected: (compressedResult: CompressionResult, uploadedUrl?: string) => void;
  folderPath?: 'articles' | 'reporters' | 'general';
  autoUploadToFirebase?: boolean;
  maxSizeKb?: number;
  label?: string;
  currentImageUrl?: string;
  aspectRatio?: '16:9' | 'preserve';
}

/**
 * Reusable High-Speed WebP Image Uploader
 * 
 * Standardizes images to 16:9 news banner ratio (1280x720)
 * and compresses down to clean WebP strictly under 100KB.
 */
export const OptimizedImageUploader: React.FC<OptimizedImageUploaderProps> = ({
  onImageSelected,
  folderPath = 'articles',
  autoUploadToFirebase = true,
  maxSizeKb = 100,
  label = 'समाचार मुख्य तस्वीर (Featured Image - 16:9 मानक)',
  currentImageUrl,
  aspectRatio = '16:9',
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('कृपया केवल वैध इमेज (JPG, PNG, WEBP) चुनें।');
      return;
    }

    setErrorMessage(null);
    setIsCompressing(true);

    try {
      let finalUrl = '';
      let result: CompressionResult;

      // 1. Attempt Server-Side Sharp Processing via /api/media/upload
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('aspectRatio', aspectRatio);

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const apiData = await res.json();
          if (apiData.success && apiData.dataUrl) {
            finalUrl = apiData.dataUrl;
            // Convert base64 to File object for Firebase Storage
            const fetchRes = await fetch(apiData.dataUrl);
            const blob = await fetchRes.blob();
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const webpFile = new File([blob], cleanName, { type: 'image/webp' });

            result = {
              file: webpFile,
              blob,
              dataUrl: apiData.dataUrl,
              originalSizeKb: apiData.originalSizeKb,
              compressedSizeKb: apiData.compressedSizeKb,
              compressionRatio: apiData.savingsPercent,
              width: apiData.width,
              height: apiData.height,
            };
          } else {
            throw new Error(apiData.error || 'Sharp API fallback');
          }
        } else {
          throw new Error('API status not ok');
        }
      } catch (sharpApiErr) {
        // Fallback to client-side HTML5 canvas WebP compression (16:9 crop)
        result = await compressImageToWebp(file, {
          maxWidth: 1280,
          maxHeight: 720,
          maxSizeKb,
          targetFormat: 'image/webp',
          initialQuality: 0.82,
          aspectRatio: aspectRatio,
        });
        finalUrl = result.dataUrl;
      }

      setCompressionStats(result);
      setPreviewUrl(result.dataUrl);

      // 2. Direct upload to Firebase Storage if enabled
      if (autoUploadToFirebase) {
        setIsUploading(true);
        try {
          const uniqueId = `img_${Date.now()}`;
          const cloudUrl = await uploadReporterPhoto(result.file, uniqueId);
          if (cloudUrl) finalUrl = cloudUrl;
        } catch (uploadErr: any) {
          console.warn('Firebase storage direct upload fallback to WebP dataUrl:', uploadErr.message);
        } finally {
          setIsUploading(false);
        }
      }

      onImageSelected(result, finalUrl);
    } catch (err: any) {
      console.error('Compression error:', err);
      setErrorMessage(err.message || 'इमेज संपीड़न में समस्या आई।');
    } finally {
      setIsCompressing(false);
      // Reset input value so user can replace with another photo smoothly
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    setPreviewUrl('');
    setCompressionStats(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelected({
      file: new File([], 'cleared.webp'),
      blob: new Blob([]),
      dataUrl: '',
      originalSizeKb: 0,
      compressedSizeKb: 0,
      compressionRatio: 0,
      width: 0,
      height: 0,
    }, '');
  };

  const handleTriggerChange = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-stone-700">
          {label}
        </label>
        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>16:9 मानक न्यूज़ फ्रेम &lt; 100KB</span>
        </span>
      </div>

      <div className="border-2 border-dashed border-stone-300 hover:border-red-600 rounded-xl p-3 bg-stone-50/80 transition-colors">
        {previewUrl ? (
          <div className="relative rounded-lg overflow-hidden bg-stone-900 border border-stone-300 shadow-sm">
            {/* 16:9 Standard Video/News Banner Aspect Container */}
            <div className="relative aspect-video w-full max-h-64 bg-stone-950 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Upload Preview"
                className="w-full h-full object-cover"
              />
              
              {/* Aspect Ratio Badge Overlay */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-amber-300 text-[10px] font-bold tracking-wider uppercase border border-amber-400/40 backdrop-blur-xs flex items-center gap-1">
                <span>16:9 न्यूज़ फ़ॉर्मेट</span>
                {compressionStats && <span>({compressionStats.width} × {compressionStats.height})</span>}
              </div>

              {/* Action Buttons: Replace or Clear */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleTriggerChange}
                  className="px-2.5 py-1 rounded bg-red-700/90 hover:bg-red-800 text-white text-[11px] font-bold transition cursor-pointer shadow-sm flex items-center gap-1 backdrop-blur-xs border border-red-500/50"
                  title="दूसरी तस्वीर चुनें या बदलें"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>तस्वीर बदलें</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full bg-black/80 hover:bg-red-600 text-white transition cursor-pointer border border-white/20"
                  title="तस्वीर हटाएं"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Compression Stats Badge */}
            {compressionStats ? (
              <div className="p-2.5 bg-stone-900/95 text-stone-100 flex items-center justify-between text-xs font-mono border-t border-stone-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">
                    मूल: {compressionStats.originalSizeKb} KB ➔ <strong className="text-emerald-300">{compressionStats.compressedSizeKb} KB</strong> (16:9 WebP)
                  </span>
                </div>
                <span className="text-emerald-400 font-bold text-[11px]">
                  -{compressionStats.compressionRatio}% संपीड़न
                </span>
              </div>
            ) : (
              <div className="p-2 bg-stone-900/90 text-stone-300 flex items-center justify-between text-[11px] border-t border-stone-800">
                <span>16:9 मानक न्यूज़ आकार लागू</span>
                <button
                  type="button"
                  onClick={handleTriggerChange}
                  className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer underline text-[11px]"
                >
                  नई तस्वीर अपलोड करें
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleTriggerChange}
            className="flex flex-col items-center justify-center py-6 cursor-pointer text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 group-hover:bg-red-100 flex items-center justify-center mb-2 transition">
              {isCompressing || isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-red-700" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <p className="text-xs font-bold text-stone-800">
              {isCompressing
                ? 'इमेज को 16:9 WebP (< 100KB) में संपीड़ित किया जा रहा है...'
                : isUploading
                ? 'क्लाउड स्टोरेज में सुरक्षित किया जा रहा है...'
                : 'क्लिक करके न्यूज़ फोटो चुनें (स्वतः 16:9 एवं WebP संपीड़न)'}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              कैमरा या गैलरी फोटो — 16:9 लैंडस्केप व 100KB से कम आकार में स्वतः अनुकूलित होगी
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {errorMessage && (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
};
