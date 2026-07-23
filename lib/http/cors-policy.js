const CORS_METHODS = 'GET, POST, DELETE, OPTIONS';
const CORS_HEADERS = 'Content-Type';

function normalizeOrigin(candidate) {
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

export function parseAllowedCorsOrigins(value = process.env.CORS_ORIGINS) {
  if (!value) return [];

  return [...new Set(
    value
      .split(',')
      .map(item => normalizeOrigin(item.trim()))
      .filter(Boolean)
  )];
}

export function evaluateCorsRequest(
  requestOrigin,
  configuredOrigins = process.env.CORS_ORIGINS,
  requestUrlOrigin = null
) {
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
    normalizedRequestOrigin
      && normalizedRequestUrlOrigin
      && normalizedRequestOrigin === normalizedRequestUrlOrigin
  );
  const allowed = sameOrigin || Boolean(
    normalizedRequestOrigin && allowedOrigins.includes(normalizedRequestOrigin)
  );

  return {
    status: sameOrigin ? 'same_origin' : allowed ? 'allowed' : 'denied',
    allowed,
    origin: normalizedRequestOrigin,
    headers: allowed && !sameOrigin
      ? {
          'Access-Control-Allow-Origin': normalizedRequestOrigin,
          'Access-Control-Allow-Methods': CORS_METHODS,
          'Access-Control-Allow-Headers': CORS_HEADERS,
          'Access-Control-Max-Age': '600',
          Vary: 'Origin',
        }
      : { Vary: 'Origin' },
  };
}
