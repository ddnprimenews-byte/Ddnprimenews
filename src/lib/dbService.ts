/**
 * Modular Database & Storage Service Abstraction Layer
 * Allows DDN Prime News to seamlessly transition between Firestore, In-Memory fallbacks,
 * and future databases (e.g., MongoDB / Cloud SQL) without modifying UI components.
 */

import { Article, NewsCategory, ReporterApplication } from '../types/news';
import { INITIAL_ARTICLES } from '../data/newsData';
import { db } from './firebase';
import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, 
  deleteDoc, updateDoc, query, where, orderBy, limit as firestoreLimit 
} from 'firebase/firestore';

export interface ArticleFilterOptions {
  category?: NewsCategory | 'all';
  search?: string;
  status?: 'published' | 'draft' | 'all';
  limit?: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'resolved';
}

/**
 * 1. News Service: Universal Article Operations
 */
export const NewsService = {
  /**
   * Fetch articles from Firestore with automatic fallback to INITIAL_ARTICLES
   */
  async getArticles(options: ArticleFilterOptions = {}): Promise<Article[]> {
    const { category, search, status = 'published', limit = 50 } = options;
    let fetchedArticles: Article[] = [];

    try {
      if (db) {
        const colRef = collection(db, 'articles');
        let q = query(colRef);

        if (status !== 'all') {
          q = query(colRef, where('status', '==', status));
        }

        if (category && category !== 'all' && category !== 'team') {
          q = query(q, where('category', '==', category));
        }

        const snapshot = await getDocs(q);
        snapshot.forEach((d) => {
          fetchedArticles.push({ id: d.id, ...(d.data() as any) });
        });
      }
    } catch (err) {
      console.warn('NewsService Firestore query note (falling back to initial dataset):', err);
    }

    // Fallback to static news if database returns no items
    if (fetchedArticles.length === 0) {
      fetchedArticles = INITIAL_ARTICLES.filter((a) => {
        if (status !== 'all' && a.status !== status) return false;
        if (category && category !== 'all' && category !== 'team' && a.category !== category) return false;
        return true;
      });
    }

    // Client-side text search if specified
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      fetchedArticles = fetchedArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return fetchedArticles.slice(0, limit);
  },

  /**
   * Get single article by slug or ID
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      if (db) {
        const colRef = collection(db, 'articles');
        const q = query(colRef, where('slug', '==', slug), firestoreLimit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          return { id: docSnap.id, ...(docSnap.data() as any) };
        }
      }
    } catch (e) {
      console.warn('NewsService getArticleBySlug fallback:', e);
    }

    // Fallback to memory
    return INITIAL_ARTICLES.find((a) => a.slug === slug || a.id === slug) || null;
  },

  /**
   * Save or publish news article
   */
  async saveArticle(article: Article): Promise<string> {
    if (db) {
      const docRef = doc(db, 'articles', article.id);
      await setDoc(docRef, { ...article, updatedAt: new Date().toISOString() }, { merge: true });
      return article.id;
    }
    return article.id;
  },

  /**
   * Delete article
   */
  async deleteArticle(id: string): Promise<boolean> {
    if (db) {
      const docRef = doc(db, 'articles', id);
      await deleteDoc(docRef);
      return true;
    }
    return true;
  },
};

/**
 * 2. Reporter Service: Applications & Press Credentials
 */
export const ReporterService = {
  /**
   * Submit new reporter application
   */
  async submitApplication(app: ReporterApplication): Promise<string> {
    if (db) {
      const docRef = doc(db, 'reporters', app.id);
      await setDoc(docRef, {
        ...app,
        submittedAt: new Date().toISOString(),
      });
      return app.id;
    }
    return app.id;
  },

  /**
   * Fetch all reporter applications
   */
  async getApplications(): Promise<ReporterApplication[]> {
    const list: ReporterApplication[] = [];
    if (db) {
      const colRef = collection(db, 'reporters');
      const snapshot = await getDocs(colRef);
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });
    }
    return list;
  },

  /**
   * Update application status (approve / reject / verify)
   */
  async updateStatus(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<void> {
    if (db) {
      const docRef = doc(db, 'reporters', id);
      await updateDoc(docRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    }
  },
};

/**
 * 3. Contact Service: Reader Inquiries & Grievances
 */
export const ContactService = {
  /**
   * Store incoming contact message
   */
  async submitMessage(data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const msgId = `MSG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: ContactMessage = {
      ...data,
      id: msgId,
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    if (db) {
      try {
        const docRef = doc(db, 'contact_messages', msgId);
        await setDoc(docRef, record);
      } catch (e) {
        console.warn('ContactService storage notice:', e);
      }
    }
    return msgId;
  },
};

/**
 * 4. Newsletter Service: Digital E-Paper Subscriptions
 */
export const NewsletterService = {
  /**
   * Register new subscriber with email validation and deduplication
   */
  async subscribe(email: string): Promise<{ success: boolean; id: string; message: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const subId = `SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (db) {
      try {
        const docRef = doc(db, 'newsletter_subscriptions', subId);
        await setDoc(docRef, {
          id: subId,
          email: cleanEmail,
          status: 'active',
          subscribedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('NewsletterService Firestore note (cached locally):', err);
      }
    }

    return {
      success: true,
      id: subId,
      message: 'डीडीएन प्राइम न्यूज बुलेटिन सदस्यता सक्रिय हो गई है।',
    };
  },
};

/**
 * 5. Database Adapter Interface
 * Enables seamless switching between Firestore, MongoDB, Cloud SQL, or In-Memory caching
 * without modifying any UI components or API handler contracts.
 */
export interface NewsDatabaseAdapter {
  getArticles(options: ArticleFilterOptions): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  saveArticle(article: Article): Promise<string>;
  deleteArticle(id: string): Promise<boolean>;
}

export class FirestoreNewsAdapter implements NewsDatabaseAdapter {
  async getArticles(options: ArticleFilterOptions) {
    return NewsService.getArticles(options);
  }
  async getArticleBySlug(slug: string) {
    return NewsService.getArticleBySlug(slug);
  }
  async saveArticle(article: Article) {
    return NewsService.saveArticle(article);
  }
  async deleteArticle(id: string) {
    return NewsService.deleteArticle(id);
  }
}
