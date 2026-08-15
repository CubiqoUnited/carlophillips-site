'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SitePoliciesFooter() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <footer className="cp-policy-footer" aria-label="Site information">
      <span>© CARLOPHILLIPS</span>
      <nav aria-label="Policies">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/cookie-policy">Cookies</Link>
      </nav>
    </footer>
  );
}
