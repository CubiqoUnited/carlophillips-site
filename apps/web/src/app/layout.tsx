import './globals.css';
import type { ReactNode } from 'react';
import { serializedColors } from '@repo/design-system/serialized-tokens';

// SEO and Metadata Configuration
const siteConfig = {
  name: 'CARLOPHILLIPS',
  tagline: 'Signature Series',
  description:
    'CARLOPHILLIPS presents a restrained study in product, material, and editorial form.',
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
        width: 1200,
        height: 630,
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
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
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
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: serializedColors.canvas },
    { media: '(prefers-color-scheme: dark)', color: serializedColors.canvas },
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
        {/* GA4 Analytics */}
        {(() => {
          const ga4Id =
            process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-CPSTAGING2026';
          return (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4Id}');`,
                }}
              />
            </>
          );
        })()}
        {/* Microsoft Clarity */}
        {(() => {
          const clarityId =
            process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'cp-clarity-staging';
          return (
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`,
              }}
            />
          );
        })()}
      </head>
      <body className="min-h-screen antialiased">
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="cp-skip-link">
          Skip to main content
        </a>

        {children}
      </body>
    </html>
  );
}
