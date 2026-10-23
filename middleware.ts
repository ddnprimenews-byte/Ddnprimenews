import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// सरल इन-मेमोरी रेट लिमिटर (1 मिनट में अधिकतम 5 अनुरोध)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 5;
const WINDOW_MS = 60 * 1000;

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'anonymous';
  const now = Date.now();

  const userLimit = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - userLimit.lastReset > WINDOW_MS) {
    userLimit.count = 1;
    userLimit.lastReset = now;
  } else {
    userLimit.count += 1;
  }

  rateLimitMap.set(ip, userLimit);

  if (userLimit.count > LIMIT) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'बहुत अधिक अनुरोध भेजे गए हैं। कृपया कुछ समय बाद प्रयास करें।' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/contact/:path*', '/api/newsletter/:path*', '/api/reporter/:path*'],
};
