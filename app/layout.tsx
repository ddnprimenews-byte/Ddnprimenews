import './globals.css';
import type { Metadata, Viewport } from 'next';
import { OrganizationSchema, WebsiteSearchSchema } from '@/components/StructuredData';

export const metadata: Metadata = {
  metadataBase: new URL('https://ddnprimenews.com'),
  title: 'DDN Prime News | दरभंगा डिजिटल नेटवर्क',
  description: 'DDN Prime News (दरभंगा डिजिटल नेटवर्क) — सच्ची निष्पक्ष निर्भय निर्भीक पत्रकारिता। उत्तर बिहार, मिथिलांचल एवं राष्ट्रीय घटनाओं की प्रामाणिक कवरेज, लाइव वीडियो बुलेटिन्स, डिजिटल ई-पेपर एवं निष्पक्ष विश्लेषण (MSME Registered: UDYAM-BR-09-0028491)',
  applicationName: 'DDN Prime News',
  authors: [{ name: 'दरभंगा डिजिटल नेटवर्क', url: 'https://ddnprimenews.com' }],
  generator: 'Next.js',
  keywords: ['DDN Prime News', 'Darbhanga News', 'Bihar News', 'हिंदी समाचार', 'दरभंगा डिजिटल नेटवर्क', 'Breaking News', 'सच्ची निष्पक्ष निर्भय निर्भीक पत्रकारिता'],
  openGraph: {
    title: 'DDN Prime News | दरभंगा डिजिटल नेटवर्क',
    description: 'DDN Prime News (दरभंगा डिजिटल नेटवर्क) — सच्ची निष्पक्ष निर्भय निर्भीक पत्रकारिता। उत्तर बिहार, मिथिलांचल एवं राष्ट्रीय घटनाओं की प्रामाणिक कवरेज, लाइव वीडियो बुलेटिन्स, डिजिटल ई-पेपर एवं निष्पक्ष विश्लेषण (MSME Registered: UDYAM-BR-09-0028491)',
    url: 'https://ddnprimenews.com',
    siteName: 'DDN Prime News',
    locale: 'hi_IN',
    type: 'website',
  },
  manifest: '/manifest.json',
  twitter: {
    card: 'summary_large_image',
    title: 'DDN Prime News | दरभंगा डिजिटल नेटवर्क',
    description: 'DDN Prime News (दरभंगा डिजिटल नेटवर्क) — सच्ची निष्पक्ष निर्भय निर्भीक पत्रकारिता। उत्तर बिहार, मिथिलांचल एवं राष्ट्रीय घटनाओं की प्रामाणिक कवरेज (MSME Registered)',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;500;600;700;800&family=Rozha+One&family=Yatra+One&display=swap"
          rel="stylesheet"
        />
        <OrganizationSchema />
        <WebsiteSearchSchema />
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased selection:bg-red-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}
