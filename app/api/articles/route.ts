import { NextResponse } from 'next/server';

const FALLBACK_ARTICLES = [
  {
    id: '1',
    title: 'DDN Prime News में आपका स्वागत है',
    content: 'दरभंगा और बिहार की ताज़ा और निष्पक्ष ख़बरों के लिए हमारे साथ जुड़े रहें।',
    category: 'मुख्य समाचार',
    imageUrl: '/images/default_news.jpg',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    return NextResponse.json({ success: true, articles: FALLBACK_ARTICLES });
  } catch (error) {
    console.error('Firestore Fetch Error:', error);
    return NextResponse.json(
      { success: false, articles: FALLBACK_ARTICLES, message: 'Fallback data loaded' },
      { status: 200 }
    );
  }
}
