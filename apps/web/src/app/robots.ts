import type { MetadataRoute } from 'next';

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://www.carlophillips.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/collections'],
        disallow: ['/api/', '/admin/', '/products/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
