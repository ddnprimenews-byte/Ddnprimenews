import { NextResponse } from 'next/server';
import { INITIAL_ARTICLES } from '@/src/data/newsData';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseDb() {
  try {
    const apps = getApps();
    const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
    return getFirestore(app);
  } catch (e) {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  let articles: any[] = [];
  const dbInstance = getFirebaseDb();

  if (dbInstance) {
    try {
      const q = query(collection(dbInstance, 'articles'), where('status', '==', 'published'));
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        articles.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (e) {
      console.warn('Firestore server-side fetch note:', e);
    }
  }

  // Fallback to INITIAL_ARTICLES if Firestore returned nothing
  if (articles.length === 0) {
    articles = INITIAL_ARTICLES.filter((a) => a.status === 'published');
  }

  if (slug) {
    const article = articles.find((a) => a.slug === slug || a.id === slug);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(article, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  }

  if (category && category !== 'all') {
    articles = articles.filter((a) => a.category === category);
  }

  return NextResponse.json(articles, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

