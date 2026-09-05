import Link from 'next/link';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';
import { resolvePostPurchaseCapabilities } from '@/lib/commerce/post-purchase-policy';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';

export const metadata = {
  title: 'Account | CARLOPHILLIPS',
  description: 'Secure CARLOPHILLIPS customer account access.',
};

export default function MemberPage() {
  const account = resolvePostPurchaseCapabilities(
    process.env,
    getCommerceEnvironment()
  ).account;
  return (
    <main id="main-content" className="cp-commerce-page cp-member-page">
      <StorefrontHeader fixed navigationAriaLabel="Account navigation" />
      <section className="cp-member-hero cp-account-signed-out">
        <div className="cp-member-hero-copy">
          <p className="cp-member-kicker">CARLOPHILLIPS / ACCOUNT</p>
          <h1 className="cp-member-title">Your account.</h1>
          <p className="cp-member-lede">
            Sign in securely to see your Shopify order history and customer
            details. No account information is shown on this device yet.
          </p>
        </div>
        <article className="cp-member-signup cp-card-panel">
          <p className="cp-member-section-label">Signed out</p>
          <h2>Access your account securely.</h2>
          {account.available && account.href ? (
            <a
              className="cp-member-button"
              href={account.href}
              rel="noreferrer"
            >
              Sign in to Shopify
            </a>
          ) : (
            <p className="cp-member-note">
              Secure account access is unavailable right now. Contact support
              for order help.
            </p>
          )}
          <Link className="cp-member-text-button" href="/contact">
            Contact support →
          </Link>
        </article>
      </section>
    </main>
  );
}
