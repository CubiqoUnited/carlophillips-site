import 'server-only';

import { isIP } from 'node:net';

type SupportEnvironment = Readonly<Record<string, string | undefined>>;

export function resolvePublicSupportFallback(
  environment: SupportEnvironment = process.env
): string | null {
  const configured = environment.CP_SUPPORT_PUBLIC_FALLBACK_URL?.trim();
  if (!configured) return null;

  try {
    const url = new URL(configured);
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.port ||
      !hostname.includes('.') ||
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      isIP(hostname) !== 0
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
