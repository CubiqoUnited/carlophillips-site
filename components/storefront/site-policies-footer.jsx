import Link from 'next/link';

export function SitePoliciesFooter() {
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
