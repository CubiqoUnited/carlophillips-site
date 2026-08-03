import { afterEach, describe, expect, it } from 'vitest';
import nextConfig from '../next.config';
import {
  evaluateCorsRequest,
  parseAllowedCorsOrigins,
} from '../lib/http/cors-policy';
import {
  DELETE,
  GET,
  OPTIONS,
  POST,
} from '../app/api/[[...path]]/route';

const originalCorsOrigins = process.env.CORS_ORIGINS;
const originalVercelEnvironment = process.env.VERCEL_ENV;

afterEach(() => {
  if (originalCorsOrigins === undefined) delete process.env.CORS_ORIGINS;
  else process.env.CORS_ORIGINS = originalCorsOrigins;

  if (originalVercelEnvironment === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalVercelEnvironment;
});

describe('page response security policy', () => {
  it('disables the framework identification header', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it('denies framing and does not attach global wildcard CORS', async () => {
    delete process.env.VERCEL_ENV;
    const [{ headers }] = await nextConfig.headers();
    const values = Object.fromEntries(headers.map(({ key, value }) => [key, value]));

    expect(values).toMatchObject({
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()',
    });
    expect(values['Access-Control-Allow-Origin']).toBeUndefined();
    expect(values['Access-Control-Allow-Headers']).toBeUndefined();
    expect(values['Strict-Transport-Security']).toBeUndefined();
  });

  it('adds HSTS only for the production deployment environment', async () => {
    process.env.VERCEL_ENV = 'production';
    const [{ headers }] = await nextConfig.headers();
    expect(headers).toContainEqual({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    });
  });
});

describe('API CORS policy', () => {
  it('normalizes exact HTTP origins and rejects wildcard or path entries', () => {
    expect(parseAllowedCorsOrigins(
      'https://preview.example.com, https://preview.example.com/, *, https://example.com/path, ftp://example.com'
    )).toEqual(['https://preview.example.com']);
  });

  it('allows same-origin requests without emitting a cross-origin grant', () => {
    expect(evaluateCorsRequest(
      'http://localhost:3000',
      '',
      'http://localhost:3000'
    )).toMatchObject({
      status: 'same_origin',
      allowed: true,
      headers: { Vary: 'Origin' },
    });
  });

  it('reflects only an exact configured cross-origin value', () => {
    const decision = evaluateCorsRequest(
      'https://preview.example.com',
      'https://preview.example.com',
      'https://www.carlophillips.com'
    );
    expect(decision).toMatchObject({
      status: 'allowed',
      allowed: true,
      headers: {
        'Access-Control-Allow-Origin': 'https://preview.example.com',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  });

  it('denies an unlisted preflight without an allow-origin header', async () => {
    process.env.CORS_ORIGINS = 'https://preview.example.com';
    const response = await OPTIONS(new Request('http://localhost:3000/api/health', {
      method: 'OPTIONS',
      headers: { Origin: 'https://attacker.example' },
    }));

    expect(response.status).toBe(403);
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    await expect(response.json()).resolves.toMatchObject({
      code: 'CORS_ORIGIN_DENIED',
    });
  });

  it('denies unlisted GET, POST, and DELETE requests before route work', async () => {
    process.env.CORS_ORIGINS = 'https://preview.example.com';

    for (const [handler, method] of [
      [GET, 'GET'],
      [POST, 'POST'],
      [DELETE, 'DELETE'],
    ]) {
      const response = await handler(
        new Request('http://localhost:3000/api/health', {
          method,
          headers: { Origin: 'https://attacker.example' },
        }),
        { params: Promise.resolve({ path: ['health'] }) }
      );
      expect(response.status).toBe(403);
      expect(response.headers.get('access-control-allow-origin')).toBeNull();
    }
  });

  it('allows the configured read-only health request and returns the exact origin', async () => {
    process.env.CORS_ORIGINS = 'https://preview.example.com';
    const response = await GET(
      new Request('http://localhost:3000/api/health', {
        headers: { Origin: 'https://preview.example.com' },
      }),
      { params: Promise.resolve({ path: ['health'] }) }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'https://preview.example.com'
    );
    expect(response.headers.get('vary')).toBe('Origin');
  });

  it('keeps retired Shopify audit and all write API paths unavailable', async () => {
    for (const [handler, method, path] of [
      [GET, 'GET', 'shopify/media-audit'],
      [GET, 'GET', 'shopify/premium-readiness'],
      [POST, 'POST', 'cart'],
      [DELETE, 'DELETE', 'cart'],
    ]) {
      const response = await handler(
        new Request(`http://localhost:3000/api/${path}`, { method }),
        { params: Promise.resolve({ path: path.split('/') }) }
      );
      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toMatchObject({
        code: 'API_ROUTE_UNAVAILABLE',
      });
    }
  });

  it('allows a live-style same-origin request using its Host header', async () => {
    process.env.CORS_ORIGINS = 'https://preview.example.com';
    const response = await GET(
      new Request('http://0.0.0.0:3000/api/health', {
        headers: {
          Host: 'localhost:3000',
          Origin: 'http://localhost:3000',
        },
      }),
      { params: Promise.resolve({ path: ['health'] }) }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
  });
});
