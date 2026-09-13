import Link from 'next/link';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';

export const metadata = {
  title: 'Private list | CARLOPHILLIPS',
  description:
    'Join the CARLOPHILLIPS private list for private releases, early access and selected notes.',
};

export default function PrivateListPage() {
  return (
    <main id="main-content" className="cp-commerce-page cp-member-page">
      <StorefrontHeader fixed navigationAriaLabel="Private list navigation" />
      <section className="cp-member-hero cp-account-signed-out">
        <div className="cp-member-hero-copy">
          <p className="cp-member-kicker">CARLOPHILLIPS / PRIVATE LIST</p>
          <h1 className="cp-member-title">Private list</h1>
          <p className="cp-member-lede">
            Early-access registration is being prepared.
          </p>
          <Link className="cp-member-text-button" href="/">
            Return to discovery →
          </Link>
        </div>
      </section>
    </main>
  );
}
