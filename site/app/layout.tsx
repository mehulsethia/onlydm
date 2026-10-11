import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/inter';
import '@fontsource-variable/nunito';
import './globals.css';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { MotionProvider } from '@/components/Reveal';
import { site } from '@/lib/site';

const appStoreId = /\/id(\d+)/.exec(site.appStoreUrl)?.[1];

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `OnlyDM — ${site.headline}`, template: '%s · OnlyDM' },
  description: site.description,
  applicationName: 'OnlyDM',
  keywords: ['OnlyDM', 'Instagram DMs only', 'Instagram without feed', 'hide Instagram Reels', 'Threads messages', 'Facebook Messenger', 'quit scrolling', 'screen time', 'digital wellbeing'],
  authors: [{ name: 'OnlyDM', url: site.url }],
  creator: 'OnlyDM',
  publisher: 'OnlyDM',
  category: 'productivity',
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  // iOS Safari's "Open in app" banner, once the App Store listing exists.
  other: appStoreId ? { 'apple-itunes-app': `app-id=${appStoreId}` } : undefined,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: 'OnlyDM',
    locale: 'en_US',
    title: `OnlyDM — ${site.headline}`,
    description: site.description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: `OnlyDM. ${site.headline}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `OnlyDM — ${site.headline}`,
    description: site.description,
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <MotionProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
