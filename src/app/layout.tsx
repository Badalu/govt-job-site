// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { generateWebsiteSchema } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarkarinaukri.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sarkari Naukri 2026 - Latest Govt Jobs | Sarkari Result | Apply Online',
    template: '%s | SarkariNaukri.com',
  },
  description: 'Get latest Sarkari Naukri 2026, Government Jobs notifications for SSC, Railway, Banking, Police, UPSC, State PSC. Check Sarkari Result, Admit Card, Answer Key. Apply Online.',
  keywords: 'sarkari naukri, govt jobs, government jobs 2026, sarkari result, admit card, ssc jobs, railway jobs, bank jobs, police jobs, upsc jobs',
  authors: [{ name: 'SarkariNaukri.com', url: SITE_URL }],
  creator: 'SarkariNaukri.com',
  publisher: 'SarkariNaukri.com',
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'SarkariNaukri.com',
    title: 'Sarkari Naukri 2026 - Latest Govt Jobs | Sarkari Result | Apply Online',
    description: 'Get latest Sarkari Naukri 2026, Government Jobs, Sarkari Result, Admit Card. Apply Online for SSC, Railway, Bank, Police jobs.',
    images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'SarkariNaukri.com' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sarkarinaukri',
    creator: '@sarkarinaukri',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXX" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Header />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
