const fallbackBaseUrl = 'https://www.carlophillips.com';

export const siteConfig = Object.freeze({
  name: 'CARLOPHILLIPS',
  tagline: 'Signature Series',
  description: 'CARLOPHILLIPS presents a private review of the Signature Series. Product availability and checkout remain release-gated.',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || fallbackBaseUrl,
  locale: 'en_US',
});

export const policyContentApproved = process.env.NEXT_PUBLIC_POLICY_CONTENT_APPROVED === 'true';
export const publicIndexingEnabled = process.env.VERCEL_ENV === 'production';

export function absoluteUrl(path = '/') {
  return new URL(path, siteConfig.baseUrl).toString();
}

export function routeMetadata({ title, description, path, index = true, follow = true }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${siteConfig.name} — ${siteConfig.tagline}` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
    robots: {
      index: publicIndexingEnabled && index,
      follow: publicIndexingEnabled && follow,
    },
  };
}
