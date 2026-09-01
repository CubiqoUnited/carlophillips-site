const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.carlophillips.com';
const releaseDate = new Date('2026-08-14T00:00:00.000Z');

export default function sitemap() {
  return [
    {
      url: baseUrl,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...(process.env.NEXT_PUBLIC_POLICY_CONTENT_APPROVED === 'true' ? ['privacy', 'terms', 'cookie-policy'] : []).map((path) => ({
      url: `${baseUrl}/${path}`,
      lastModified: releaseDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    })),
  ];
}
