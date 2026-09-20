import { headers } from 'next/headers';
import type { MetadataRoute } from 'next';

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://www.carlophillips.com';

/**
 * Host is read from the request rather than an environment variable so that
 * staging cannot serve production's rules because a variable was set wrong.
 * A robots directive is a request to compliant crawlers, never access control
 * (KAN-24); it is the outer layer, not the gate.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host')?.toLowerCase() || '';
  const isProductionHost = host.startsWith('www.carlophillips.com');

  if (!isProductionHost) {
    // KAN-17 / KAN-24: staging and preview hosts are not for crawlers, and
    // must not advertise the production sitemap into a duplicate-content
    // collision with www.
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/collections'],
        disallow: [
          '/api/',
          '/admin/',
          // KAN-22: /products/ is the non-canonical path that 308-redirects to
          // /product/. It stays disallowed as duplicate-path suppression.
          // /product/ itself is deliberately NOT disallowed — that is the real
          // PDP route and must stay indexable. Unknown handles now 404
          // (KAN-22), which is what actually stops indexable garbage.
          '/products/',
          '/hero-preview',
          '/private-list',
          '/runwaymodels',
          '/media-lab',
          '/checkout/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
