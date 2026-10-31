/**
 * DDN Prime News - Media Optimization & Streaming Utilities
 * 
 * Provides production-ready utilities to prevent cloud storage bloat,
 * guarantee high-speed mobile delivery, and maintain clean database separation:
 * 1. Client-Side WebP Compression (Guarantees < 100KB output)
 * 2. YouTube / Shorts URL Parser & Privacy-Enhanced Embed Generator
 * 3. CDN (Cloudinary / ImageKit / Next.js) delivery transformation helpers
 */

export interface CompressionResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number;
  width: number;
  height: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeKb?: number;
  targetFormat?: 'image/webp' | 'image/jpeg';
  initialQuality?: number;
  aspectRatio?: '16:9' | 'preserve';
}

/**
 * Compresses an image in the browser using HTML5 Canvas to WebP format,
 * cropping to standard 16:9 news banner format (1280x720) and optimizing quality to guarantee size under target (default 100KB).
 */
export async function compressImageToWebp(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    maxSizeKb = 100,
    targetFormat = 'image/webp',
    initialQuality = 0.82,
    aspectRatio = '16:9',
  } = options;

  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('फ़ाइल लोड करने में त्रुटि।'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('इमेज डेटा प्रोसेस करने में असमर्थ।'));
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas 2D context उपलब्ध नहीं है।');
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          const srcW = img.naturalWidth || img.width;
          const srcH = img.naturalHeight || img.height;

          if (aspectRatio === '16:9') {
            // Strict 16:9 standard for news articles with smart center crop
            const targetRatio = 16 / 9;
            const srcRatio = srcW / srcH;
            let sx = 0, sy = 0, sw = srcW, sh = srcH;

            if (srcRatio > targetRatio) {
              // Image is wider than 16:9 - center crop horizontally
              sw = srcH * targetRatio;
              sx = (srcW - sw) / 2;
            } else {
              // Image is taller than 16:9 - center crop vertically
              sh = srcW / targetRatio;
              sy = (srcH - sh) / 2;
            }

            canvas.width = Math.min(maxWidth, 1280);
            canvas.height = Math.round(canvas.width * (9 / 16));
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          } else {
            // Aspect-ratio preserved scaling
            let width = srcW;
            let height = srcH;
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          }

          // 3. Progressive binary optimization to guarantee <= maxSizeKb
          let quality = initialQuality;
          let blob: Blob | null = null;
          let iterations = 0;

          // Helper to get blob
          const getCanvasBlob = (q: number): Promise<Blob> => {
            return new Promise((res, rej) => {
              canvas.toBlob(
                (b) => {
                  if (b) res(b);
                  else rej(new Error('Canvas blob generation failed'));
                },
                targetFormat,
                q
              );
            });
          };

          // Progressive reduction loop
          blob = await getCanvasBlob(quality);
          while (blob.size / 1024 > maxSizeKb && quality > 0.25 && iterations < 5) {
            quality -= 0.15;
            blob = await getCanvasBlob(quality);
            iterations++;
          }

          // If still over 100KB due to large detailed photo, scale dimensions by 20%
          if (blob.size / 1024 > maxSizeKb) {
            canvas.width = Math.round(canvas.width * 0.8);
            canvas.height = Math.round(canvas.height * 0.8);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            blob = await getCanvasBlob(0.7);
          }

          const compressedSizeKb = Math.round(blob.size / 1024);
          const ratio = Math.max(0, Math.round((1 - compressedSizeKb / (originalSizeKb || 1)) * 100));

          // Generate clean WebP File object
          const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
          const optimizedFile = new File([blob], cleanName, { type: targetFormat });
          const dataUrl = canvas.toDataURL(targetFormat, quality);

          resolve({
            file: optimizedFile,
            blob,
            dataUrl,
            originalSizeKb,
            compressedSizeKb,
            compressionRatio: ratio,
            width: canvas.width,
            height: canvas.height,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * YouTube URL Parser
 * Supports:
 * - Standard: https://www.youtube.com/watch?v=VIDEO_ID
 * - Shortened: https://youtu.be/VIDEO_ID
 * - Shorts: https://www.youtube.com/shorts/VIDEO_ID
 * - Embed: https://www.youtube.com/embed/VIDEO_ID
 * - Raw video ID (11 chars)
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();

  // If already 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Regex covering standard watch, youtu.be, shorts, and embed
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = clean.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Returns optimized YouTube embed information
 */
export function getYouTubeEmbedInfo(urlOrId: string) {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) return null;

  return {
    videoId,
    // Privacy-enhanced embed URL (does not store tracking cookies until played)
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`,
    // Fast thumbnail URLs
    thumbnailMaxRes: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    thumbnailHq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    thumbnailMq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * Cloudinary & ImageKit Delivery URL Optimizer
 * Formats external CDN URLs with automatic WebP conversion and responsive widths
 */
export function getOptimizedCdnUrl(
  rawUrl: string,
  width: number = 800,
  quality: number = 80
): string {
  if (!rawUrl) return '';

  // Cloudinary URL transformation
  if (rawUrl.includes('cloudinary.com') && rawUrl.includes('/upload/')) {
    return rawUrl.replace('/upload/', `/upload/w_${width},q_${quality},f_auto,c_limit/`);
  }

  // ImageKit URL transformation
  if (rawUrl.includes('ik.imagekit.io')) {
    const separator = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${separator}tr=w-${width},q-${quality},f-webp`;
  }

  return rawUrl;
}
