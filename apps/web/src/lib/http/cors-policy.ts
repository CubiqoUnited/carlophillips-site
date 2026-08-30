const CORS_METHODS = 'GET, POST, DELETE, OPTIONS';
const CORS_HEADERS = 'Content-Type';

export interface CorsDecision {
  status: 'same_origin' | 'allowed' | 'denied';
  allowed: boolean;
  origin: string | null;
  headers: Record<string, string>;
}

function normalizeOrigin(candidate: string | null | undefined): string | null {
  if (!candidate || candidate === '*') return null;

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    if (url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function parseAllowedCorsOrigins(
  value: string | undefined = process.env.CORS_ORIGINS
): string[] {
  if (!value) return [];

  return [
    ...new Set(
      value
        .split(',')
        .map((item) => normalizeOrigin(item.trim()))
        .filter((origin): origin is string => Boolean(origin))
    ),
  ];
}

export function evaluateCorsRequest(
  requestOrigin: string | null,
  configuredOrigins: string | undefined = process.env.CORS_ORIGINS,
  requestUrlOrigin: string | null = null
): CorsDecision {
  if (!requestOrigin) {
    return {
      status: 'same_origin',
      allowed: true,
      origin: null,
      headers: { Vary: 'Origin' },
    };
  }

  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);
  const normalizedRequestUrlOrigin = normalizeOrigin(requestUrlOrigin);
  const allowedOrigins = parseAllowedCorsOrigins(configuredOrigins);
  const sameOrigin = Boolean(
    normalizedRequestOrigin &&
    normalizedRequestUrlOrigin &&
    normalizedRequestOrigin === normalizedRequestUrlOrigin
  );
  const allowed =
    sameOrigin ||
    Boolean(
      normalizedRequestOrigin &&
      allowedOrigins.includes(normalizedRequestOrigin)
    );

  return {
    status: sameOrigin ? 'same_origin' : allowed ? 'allowed' : 'denied',
    allowed,
    origin: normalizedRequestOrigin,
    headers:
      allowed && !sameOrigin
        ? {
            'Access-Control-Allow-Origin': normalizedRequestOrigin || '',
            'Access-Control-Allow-Methods': CORS_METHODS,
            'Access-Control-Allow-Headers': CORS_HEADERS,
            'Access-Control-Max-Age': '600',
            Vary: 'Origin',
          }
        : { Vary: 'Origin' },
  };
}
