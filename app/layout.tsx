import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'DDN Prime News | दरभंगा डिजिटल नेटवर्क',
  description: 'सच्ची, निर्भीक और निष्पक्ष पत्रकारिता - दरभंगा डिजिटल नेटवर्क की आधिकारिक डिजिटल मीडिया इकाई (MSME Registered)',
  applicationName: 'DDN Prime News',
  authors: [{ name: 'दरभंगा डिजिटल नेटवर्क', url: 'https://ddnprimenews.com' }],
  generator: 'Next.js',
  keywords: ['DDN Prime News', 'Darbhanga News', 'Bihar News', 'हिंदी समाचार', 'दरभंगा डिजिटल नेटवर्क', 'Breaking News'],
  openGraph: {
    title: 'DDN Prime News | दरभंगा डिजिटल नेटवर्क',
    description: 'सच्ची, निर्भीक और निष्पक्ष पत्रकारिता - दरभंगा डिजिटल नेटवर्क की आधिकारिक डिजिटल मीडिया इकाई (MSME Registered)',
    url: 'https://ddnprimenews.com',
    siteName: 'DDN Prime News',
    locale: 'hi_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DDN Prime News | दरभंगा डिजिटल नेटवर्क',
    description: 'सच्ची, निर्भीक और निष्पक्ष पत्रकारिता - दरभंगा डिजिटल नेटवर्क की आधिकारिक डिजिटल मीडिया इकाई',
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
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased selection:bg-red-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}
