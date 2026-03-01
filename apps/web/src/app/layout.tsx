import type { Metadata, Viewport } from 'next';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Upaya — Your Spiritual Problem Solver',
  description:
    'AI-powered kundli analysis, personalized remedy plans, temple puja booking, and spiritual guidance. Free kundli analysis — no login required.',
  keywords: [
    'kundli',
    'horoscope',
    'astrology',
    'vedic astrology',
    'remedy',
    'dosha',
    'mangal dosha',
    'puja booking',
    'spiritual',
    'upaya',
  ],
  openGraph: {
    title: 'Upaya — Your Spiritual Problem Solver',
    description: 'AI-powered kundli analysis & personalized remedy plans',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F0A2E',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body>
        <ClientLayout>
          <div className="app-layout">{children}</div>
        </ClientLayout>
      </body>
    </html>
  );
}
