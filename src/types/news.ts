export type NewsCategory = 
  | 'all'
  | 'bihar'
  | 'national'
  | 'politics'
  | 'crime'
  | 'education-health'
  | 'sports'
  | 'team'
  | 'epaper'
  | 'reporter'
  | 'legal';

export interface ArticleFAQ {
  question: string;
  answer: string;
}

export interface ArticleSection {
  heading: string;
  content: string;
  isImportant?: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  aeoSummary?: string; // Direct concise answer for AEO / Google AI Overviews
  content: string[];
  sections?: ArticleSection[];
  category: NewsCategory;
  categoryHindi: string;
  location: string;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  publishedAt: string;
  datePublished: string; // ISO 8601 timestamp
  dateModified: string;  // ISO 8601 timestamp
  readTime: string;
  imageUrl: string;
  imageCaption?: string;
  isLead?: boolean;
  isBreaking?: boolean;
  status: 'published' | 'draft';
  trendingRank?: number; // 1-10 for Today's Trending (Column B)
  isArchiveTrending?: boolean; // For Previous Trending / 2-4 days archive (Column C)
  archiveDaysAgo?: number; // e.g. 2, 3, 4 days ago
  views: number;
  tags: string[];
  faqs?: ArticleFAQ[];
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  aqi: number;
}

export interface ReporterApplication {
  id: string;
  fullName: string;
  fatherName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  district: string;
  block: string;
  panchayat: string;
  qualification: string;
  experience: string;
  beatPreference: string;
  photoUrl?: string;
  idDocumentUrl?: string;
  appliedDate: string;
  status: 'pending' | 'verified' | 'rejected' | 'card_generated';
  adminNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface VideoBulletin {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnail: string;
  anchor: string;
  timeAgo: string;
}

export type LegalPageType = 
  | 'privacy' 
  | 'about' 
  | 'contact' 
  | 'editorial' 
  | 'corrections' 
  | 'terms';
