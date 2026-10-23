'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

/**
 * Production SafeImage Component for DDN Prime News
 * Automatically intercepts broken images and falls back to default news graphic
 * Enforces referrerPolicy="no-referrer" for hotlink & privacy protection
 */
export default function SafeImage({
  src,
  fallbackSrc = '/images/default_news.jpg',
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || 'DDN Prime News'}
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
