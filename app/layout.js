import './globals.css';
import { designSystemRuntimeContract } from '@/lib/design-system/runtime-contract';
import { SitePoliciesFooter } from '@/components/storefront/site-policies-footer';
import { ThemeStyle } from '@/components/theme/theme-style';
import { SiteObservability } from '@/components/analytics/site-observability';
import { publicIndexingEnabled, siteConfig } from '@/lib/site/site-config';

// SEO and Metadata Configuration
const metadataConfig = {
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
  keywords: metadataConfig.keywords,
  
  // Canonical URL
  metadataBase: new URL(siteConfig.baseUrl),
  alternates: {
    canonical: '/',
  },
  
  // Open Graph
  openGraph: {
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.baseUrl,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
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
    images: ['/opengraph-image'],
  },
  
  // Robots
  robots: {
    index: publicIndexingEnabled,
    follow: publicIndexingEnabled,
    googleBot: {
      index: publicIndexingEnabled,
      follow: publicIndexingEnabled,
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
  url: siteConfig.baseUrl,
  logo: `${siteConfig.baseUrl}/icon.svg`,
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.baseUrl,
  description: siteConfig.description,
  inLanguage: 'en-US',
};

export default function RootLayout({ children }) {
  const observabilityEnabled = process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_ENABLED === 'true';
  return (
    <html lang="en">
      <head>
        <ThemeStyle />
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
        <SitePoliciesFooter />
        <SiteObservability enabled={observabilityEnabled} />
      </body>
    </html>
  );
}
