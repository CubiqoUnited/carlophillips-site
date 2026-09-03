import Link from 'next/link';
import type { PostPurchaseCapabilities } from '@/lib/commerce/post-purchase-policy';
import { postPurchaseJourney } from '@/lib/commerce/post-purchase-policy';
import { FitMemory } from './FitMemory';

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
      <header className="cp-commerce-header cp-commerce-header-fixed">
        <div className="cp-commerce-header-inner">
          <Link href="/" className="cp-commerce-brand">
            CARLOPHILLIPS
          </Link>
          <nav className="cp-commerce-nav" aria-label="Aftercare navigation">
            <Link href="/shop">Collection</Link>
            <span aria-current="page">Aftercare</span>
            <Link href="/bag">Bag</Link>
          </nav>
        </div>
      </header>

      <section className="cp-member-hero">
        <div className="cp-member-hero-copy">
          <p className="cp-member-kicker">CARLOPHILLIPS / AFTERCARE</p>
          <h1 className="cp-member-title">
            From confirmation to what comes next.
          </h1>
          <p className="cp-member-lede">
            Shopify remains the live authority for your order, payment,
            tracking, cancellation and refund. CP adds a clear service path
            without copying or inventing those facts.
          </p>
          <p className="cp-member-note">
            This page never asks for payment details and does not display an
            order unless Shopify authenticates it.
          </p>
        </div>

        <article className="cp-member-signup cp-card-panel">
          <p className="cp-member-section-label">Live order status</p>
          <h2>Your order truth stays in Shopify.</h2>
          <CapabilityAction
            capability={capabilities.account}
            label="Open secure order status"
          />
          <Link className="cp-member-text-button" href="/contact">
            Ask CP support →
          </Link>
        </article>
      </section>

      <section className="cp-member-section" aria-labelledby="journey-title">
        <div className="cp-member-section-heading">
          <p className="cp-member-section-label">The complete journey</p>
          <h2 id="journey-title">One source of truth at every step.</h2>
        </div>
        <ol className="cp-member-benefit-grid cp-journey-grid">
          {postPurchaseJourney.map((step, index) => (
            <li className="cp-member-benefit cp-card-panel" key={step.id}>
              <p className="cp-member-index">0{index + 1}</p>
              <h3>{step.label}</h3>
              <p>{step.copy}</p>
              <small>{step.authority}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="cp-member-dashboard" aria-labelledby="service-title">
        <div className="cp-member-dashboard-header">
          <div>
            <p className="cp-member-section-label">Service and relationship</p>
            <h2 id="service-title">Continue with confidence.</h2>
          </div>
          <span className="cp-member-preview-badge">Shopify authoritative</span>
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

          <article className="cp-card-panel cp-member-saved">
            <p className="cp-member-section-label">Review eligibility</p>
            <h3>Only after verified delivery.</h3>
            <CapabilityAction
              capability={capabilities.reviews}
              label="Review your piece"
            />
          </article>

          <article className="cp-card-panel cp-member-saved">
            <p className="cp-member-section-label">CP Credit</p>
            <h3>No invented balance.</h3>
            <CapabilityAction
              capability={capabilities.credit}
              label="View CP Credit"
            />
          </article>

          <article className="cp-card-panel cp-member-saved">
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

        <div className="cp-member-card-row cp-fit-memory-row">
          <div className="cp-member-profile cp-card-panel">
            <FitMemory />
          </div>
          <article className="cp-stone-card">
            <p>CP AFTERCARE</p>
            <div className="cp-stone-card-mark" aria-hidden="true">
              CP
            </div>
            <div className="cp-stone-card-footer">
              <span>ORDER FACTS BY SHOPIFY</span>
              <span>SERVICE BY CP</span>
            </div>
          </article>
        </div>
      </section>

      <footer className="cp-member-footer">
        <p>Shopify holds the order. CP stays with the customer.</p>
        <Link href="/">Return to CARLOPHILLIPS</Link>
      </footer>
    </main>
  );
}
