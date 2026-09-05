import Link from 'next/link';
import type { PostPurchaseCapabilities } from '@/lib/commerce/post-purchase-policy';
import { StorefrontHeader } from '../layout/StorefrontHeader';

function CapabilityAction({
  capability,
  label,
}: {
  capability: PostPurchaseCapabilities[keyof PostPurchaseCapabilities];
  label: string;
}) {
  if (!capability.available || !capability.href)
    return <p className="cp-member-note">{capability.reason}</p>;

  return (
    <a
      className="cp-member-text-button"
      href={capability.href}
      rel="noreferrer"
    >
      {label} →
    </a>
  );
}

export function MemberExperience({
  capabilities,
}: {
  capabilities: PostPurchaseCapabilities;
}) {
  return (
    <main id="main-content" className="cp-commerce-page cp-member-page">
      <StorefrontHeader
        fixed
        pageLabel="Aftercare"
        navigationAriaLabel="Aftercare navigation"
      />

      <section className="cp-member-hero">
        <div className="cp-member-hero-copy">
          <p className="cp-member-kicker">CARLOPHILLIPS / AFTERCARE</p>
          <h1 className="cp-member-title">
            From confirmation to what comes next.
          </h1>
          <p className="cp-member-lede">
            Find order status, delivery help, returns and product care in one
            clear service path.
          </p>
          <p className="cp-member-note">
            For privacy, order details only appear after secure account access.
          </p>
        </div>

        <article className="cp-member-signup cp-card-panel">
          <p className="cp-member-section-label">Your orders</p>
          <h2>Access your order securely.</h2>
          <CapabilityAction
            capability={capabilities.account}
            label="Open secure order status"
          />
          <Link className="cp-member-text-button" href="/contact">
            Ask CP support →
          </Link>
        </article>
      </section>

      <section className="cp-member-dashboard" aria-labelledby="service-title">
        <div className="cp-member-dashboard-header">
          <div>
            <p className="cp-member-section-label">Service and relationship</p>
            <h2 id="service-title">Continue with confidence.</h2>
          </div>
        </div>

        <div className="cp-member-lower-grid cp-aftercare-grid">
          <article className="cp-card-panel cp-member-saved">
            <p className="cp-member-section-label">Return or exchange</p>
            <h3>Start with the verified order.</h3>
            <CapabilityAction
              capability={capabilities.returns}
              label="Open returns"
            />
            {!capabilities.returns.available && (
              <Link className="cp-member-text-button" href="/contact">
                Contact CP support →
              </Link>
            )}
          </article>

          {capabilities.credit.available && (
            <article className="cp-card-panel cp-member-saved">
              <p className="cp-member-section-label">CP Credit</p>
              <h3>Your balance stays in Shopify.</h3>
              <CapabilityAction
                capability={capabilities.credit}
                label="View CP Credit"
              />
            </article>
          )}

          <article
            className={`cp-card-panel cp-member-saved${
              capabilities.credit.available
                ? ''
                : ' cp-aftercare-continuation-wide'
            }`}
          >
            <p className="cp-member-section-label">Continue the relationship</p>
            <h3>Return to the collection.</h3>
            <p>
              Explore current pieces without interrupting your service journey.
            </p>
            <Link className="cp-member-text-button" href="/shop">
              Continue shopping →
            </Link>
          </article>
        </div>
      </section>

      <footer className="cp-member-footer">
        <p>CARLOPHILLIPS aftercare.</p>
        <Link href="/">Return to CARLOPHILLIPS</Link>
      </footer>
    </main>
  );
}
