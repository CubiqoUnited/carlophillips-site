const path = require('node:path');
const { loadEnvConfig } = require('@next/env');

const repositoryRoot = path.join(__dirname, '../..');
loadEnvConfig(repositoryRoot);

function securityHeaders() {
  const headers = [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Content-Security-Policy', value: "frame-ancestors 'none';" },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value:
        'camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()',
    },
  ];

  if (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT === 'production'
  ) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    });
  }

  return headers;
}

const nextConfig = {
  outputFileTracingRoot: repositoryRoot,
  transpilePackages: ['@repo/design-system', '@repo/shopify', '@repo/utils'],
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com',
      },
    ],
  },
  webpack(config, { dev }) {
    if (dev) {
      // Reduce CPU/memory from file watching
      config.watchOptions = {
        poll: 2000, // check every 2 seconds
        aggregateTimeout: 300, // wait before rebuilding
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async redirects() {
    const canonicalHost = 'https://www.carlophillips.com';
    const brandRedirectHosts = [
      'carlophillips.com',
      'lovecarlo.com',
      'www.lovecarlo.com',
      'houseofcarlphillips.com',
      'www.houseofcarlphillips.com',
    ];

    return brandRedirectHosts.map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: `${canonicalHost}/:path*`,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders(),
      },
    ];
  },
};

module.exports = nextConfig;
