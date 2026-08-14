import './globals.css';
import { designSystemRuntimeContract } from '@/lib/design-system/runtime-contract';

// SEO and Metadata Configuration
const siteConfig = {
  name: 'CARLOPHILLIPS',
  tagline: 'Signature Series',
  description: 'The CARLOPHILLIPS Signature Hoodie. Heavyweight black fleece, quiet detail, and secure checkout.',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.carlophillips.com',
  locale: 'en_US',
  type: 'website',
  twitterHandle: '@carlophillips',
  keywords: [
    'premium essentials',
    'premium apparel',
    'product design',
    'signature hoodie',
    'premium release',
    'minimal design',
  ],
};

export const metadata = {
  // Basic Metadata
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  
  // Canonical URL
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  
  // Open Graph
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: siteConfig.type,
    images: [
      {
        url: '/opengraph-image',
        width: designSystemRuntimeContract.openGraph.size.width,
        height: designSystemRuntimeContract.openGraph.size.height,
        alt: `${siteConfig.name} - ${siteConfig.tagline}`,
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: ['/opengraph-image'],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  
  // Manifest for PWA
  manifest: '/site.webmanifest',
  
  // App-specific
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: siteConfig.name,
  },
  
  // Format Detection
  formatDetection: {
    telephone: false,
  },
};

// Viewport Configuration
export const viewport = {
  width: designSystemRuntimeContract.viewport.width,
  initialScale: designSystemRuntimeContract.viewport.initialScale,
  maximumScale: designSystemRuntimeContract.viewport.maximumScale,
  userScalable: designSystemRuntimeContract.viewport.userScalable,
  themeColor: [
    { media: designSystemRuntimeContract.media.lightScheme, color: designSystemRuntimeContract.theme.canvas },
    { media: designSystemRuntimeContract.media.darkScheme, color: designSystemRuntimeContract.theme.canvas },
  ],
};

// JSON-LD Structured Data
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.svg`,
  sameAs: [
    'https://instagram.com/carlophillips',
    'https://tiktok.com/@carlophillips',
    'https://pinterest.com/carlophillips',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: 'en-US',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, websiteJsonLd]) }}
        />
      </head>
      <body>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="cp-visually-hidden cp-skip-link"
        >
          Skip to main content
        </a>
        
        {children}
      </body>
    </html>
  );
}
