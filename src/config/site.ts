/**
 * Official Site Configuration for DDN Prime News
 * Single Source of Truth for Domain, SEO, Canonical URLs, and Publisher Metadata
 */

export const SITE_CONFIG = {
  // Official Production Domain (Strict single-point configuration)
  productionDomain: 'https://ddnprimenews.com',
  name: 'DDN Prime News',
  nameHindi: 'डीडीएन प्राइम न्यूज',
  organization: 'दरभंगा डिजिटल नेटवर्क (Darbhanga Digital Network)',
  msmeRegistration: 'UDYAM-BR-09-0028491 (MSME Registered, Govt. of India)',
  publisherType: 'NewsMediaOrganization',
  
  tagline: 'सच्ची, निर्भीक और निष्पक्ष पत्रकारिता',
  description: 'दरभंगा डिजिटल नेटवर्क (DDN Prime News) - उत्तर बिहार एवं मिथिलांचल की प्रामाणिक, निर्भीक और निष्पक्ष डिजिटल पत्रकारिता इकाई। MSME पंजीकृत संस्थान।',
  
  locale: 'hi_IN',
  language: 'hi',
  defaultOgImage: 'https://ddnprimenews.com/images/ddn_hero_news.jpg',
  
  editorial: {
    chiefEditor: 'Rajesh Kumar Sahu (राजेश कुमार साहू)',
    officeAddress: 'वार्ड नंबर 9, पैगंबरपुर, पोस्ट- दरमा, P.S.- क्यूटी, जिला- दरभंगा, बिहार - 847121',
    phone: '9341050287',
    formattedPhone: '+91-9341050287',
    email: 'ddnprimenews@gmail.com',
    editorialEmail: 'editorial@ddnprimenews.com',
    grievanceOfficer: 'राजेश कुमार साहू (Grievance Redressal Officer)',
  },

  socialLinks: {
    whatsappChannel: 'https://whatsapp.com/channel/ddnprimenews',
    whatsappDirect: 'https://api.whatsapp.com/send?phone=919341050287',
    facebook: 'https://facebook.com/ddnprimenews',
    twitter: 'https://twitter.com/ddnprimenews',
    youtube: 'https://youtube.com/@ddnprimenews',
    healthPartner: 'https://www.hindilhealthguide.org',
  },

  adSense: {
    // AdSense is disabled until official Google AdSense approval and real publisher ID are provided
    publisherId: '', // Place approved 'ca-pub-XXXXXXXXXXXXXXXX' here once verified by Google
    enabled: false,
  }
} as const;

/**
 * Returns absolute canonical URL guaranteed to use the production domain.
 * Prevents dev / preview URLs from ever leaking into SEO canonicals.
 */
export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.productionDomain}${cleanPath === '/' ? '' : cleanPath}`;
}

export function getArticleUrl(slug: string): string {
  return getCanonicalUrl(`/news/${slug}`);
}

export function getCategoryUrl(category: string): string {
  return getCanonicalUrl(`/category/${category}`);
}
