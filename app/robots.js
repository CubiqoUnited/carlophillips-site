const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.carlophillips.com';
const policiesApproved = process.env.NEXT_PUBLIC_POLICY_CONTENT_APPROVED === 'true';

export default function robots() {
  if (process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT !== 'production') {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/collections', ...(policiesApproved ? ['/privacy', '/terms', '/cookie-policy'] : [])],
        disallow: ['/api/', '/admin/', '/products/', ...(policiesApproved ? [] : ['/privacy', '/terms', '/cookie-policy'])],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
