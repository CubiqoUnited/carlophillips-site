const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.carlophillips.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/collections', '/about', '/lookbook'],
        disallow: ['/api/', '/admin/', '/products/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
