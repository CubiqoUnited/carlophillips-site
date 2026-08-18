'use client';

import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

function stripPrivateUrlParts(event) {
  try {
    const url = new URL(event.url);
    return { ...event, url: `${url.origin}${url.pathname}` };
  } catch {
    return null;
  }
}

export function SiteObservability({ enabled }) {
  const pathname = usePathname();
  if (!enabled || pathname?.startsWith('/admin')) return null;

  return (
    <>
      <Analytics beforeSend={stripPrivateUrlParts} />
      <SpeedInsights />
    </>
  );
}
