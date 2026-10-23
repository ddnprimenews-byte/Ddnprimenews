import { NextRequest, NextResponse } from 'next/server';
import { optimizeImageWithSharp } from '@/src/lib/serverImageOptimizer';

export const runtime = 'nodejs'; // sharp requires Node.js runtime environment

/**
 * High-Performance Image Optimization & Compression Endpoint
 * 
 * Intercepts any uploaded photo (JPEG, PNG, TIFF, WebP, etc.),
 * resizes to max 1200px width, strips EXIF tags, converts strictly to WebP,
 * and guarantees file size under 100KB for zero storage bloat and rapid mobile load times.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'कोई इमेज फ़ाइल प्राप्त नहीं हुई।' },
        { status: 400 }
      );
    }

    // Validate mime-type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'अमान्य फ़ाइल प्रकार। केवल इमेज अपलोड स्वीकार्य हैं।' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Run Sharp Optimization Pipeline
    const optimized = await optimizeImageWithSharp(inputBuffer, {
      maxWidth: 1200,
      maxHeight: 1200,
      maxSizeKb: 100, // Strictly under 100KB
      quality: 82,
    });

    // Generate Base64 WebP Data URL for immediate preview or database storage
    const base64Webp = `data:image/webp;base64,${optimized.buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      dataUrl: base64Webp,
      format: 'webp',
      width: optimized.width,
      height: optimized.height,
      originalSizeKb: optimized.originalSizeKb,
      compressedSizeKb: optimized.sizeKb,
      savingsPercent: optimized.savingsPercent,
      message: `इमेज सफलतापूर्वक WebP प्रारूप में संपीड़ित हुई (${optimized.originalSizeKb} KB ➔ ${optimized.sizeKb} KB, -${optimized.savingsPercent}% बचत)।`,
    });
  } catch (error: any) {
    console.error('Image compression API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'इमेज संपीड़न प्रक्रिया में त्रुटि आई।',
      },
      { status: 500 }
    );
  }
}
