import './globals.css';
import type { Metadata, Viewport } from 'next';
import { OrganizationSchema, WebsiteSearchSchema } from '@/components/StructuredData';

export const metadata: Metadata = {
  metadataBase: new URL('https://ddnprimenews.com'),
  title: 'DDN Prime News | दैनिक डिजिटल ई-पेपर एवं ताज़ा समाचार',
  description: 'DDN Prime News (दरभंगा डिजिटल नेटवर्क) — दैनिक डिजिटल ई-पेपर, ताज़ा समाचार, लाइव बुलेटिन एवं निष्पक्ष विश्लेषण। उत्तर बिहार, मिथिलांचल एवं देश की प्रमुख खबरें।',
  applicationName: 'DDN Prime News',
  authors: [{ name: 'दरभंगा डिजिटल नेटवर्क', url: 'https://ddnprimenews.com' }],
  generator: 'Next.js',
  keywords: ['DDN Prime News', 'Darbhanga News', 'Bihar News', 'हिंदी समाचार', 'दरभंगा डिजिटल नेटवर्क', 'डिजिटल ई-पेपर', 'Breaking News'],
  openGraph: {
    title: 'DDN Prime News | दैनिक डिजिटल ई-पेपर (8 पृष्ठ ब्रॉडशीट)',
    description: 'आज का दैनिक डिजिटल ई-पेपर (8 पृष्ठ संपूर्ण ब्रॉडशीट) एवं ताज़ा समाचार पढ़ें। दरभंगा डिजिटल नेटवर्क की निष्पक्ष पत्रकारिता।',
    url: 'https://ddnprimenews.com',
    siteName: 'DDN Prime News',
    locale: 'hi_IN',
    type: 'website',
  },
  manifest: '/manifest.json',
  twitter: {
    card: 'summary_large_image',
    title: 'DDN Prime News | दैनिक डिजिटल ई-पेपर',
    description: 'आज का दैनिक डिजिटल ई-पेपर (8 पृष्ठ संपूर्ण ब्रॉडशीट) एवं ताज़ा समाचार पढ़ें।',
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
