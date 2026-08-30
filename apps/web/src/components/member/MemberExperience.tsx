'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

const memberBenefits = [
  ['Private access', 'See selected releases before they open publicly.'],
  [
    'Saved pieces',
    'Keep your pieces, sizes, and future reservations together.',
  ],
  [
    'CP Credit',
    'Receive clear account credit for selected moments, not points.',
  ],
  [
    'Fit memory',
    'Remember your preferred size and fit across future releases.',
  ],
];

const ledger = [
  ['Private list welcome', '+€15.00', 'Available for a future piece'],
  ['Member credit', '€15.00', 'Current preview balance'],
];

export function MemberExperience() {
  const [joined, setJoined] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoined(true);
  }

  return (
    <main id="main-content" className="cp-commerce-page cp-member-page">
      <header className="cp-commerce-header cp-commerce-header-fixed">
        <div className="cp-commerce-header-inner">
          <Link href="/" className="cp-commerce-brand">
            CARLOPHILLIPS
          </Link>
          <nav className="cp-commerce-nav" aria-label="Member navigation">
            <Link href="/shop">Collection</Link>
            <span aria-current="page">Member</span>
            <Link href="/bag">Bag</Link>
          </nav>
        </div>
      </header>

      <section className="cp-member-hero">
        <div className="cp-member-hero-copy">
          <p className="cp-member-kicker">CARLOPHILLIPS / CP MEMBER</p>
          <h1 className="cp-member-title">A private layer around the brand.</h1>
          <p className="cp-member-lede">
            Join the private list for access, recognition, and a closer
            relationship with CP. Membership is not a points club and it is not
            a discount promise.
          </p>
          <p className="cp-member-note">
            Preview surface — this local review does not create a live Shopify
            customer account, send marketing, or issue real credit.
          </p>
        </div>

        <div className="cp-member-signup cp-card-panel">
          <p className="cp-member-section-label">01 / Become known to CP</p>
          {joined ? (
            <div className="cp-member-confirmation" role="status">
              <p className="cp-member-confirmation-mark" aria-hidden="true">
                ✓
              </p>
              <h2>You are on the private list.</h2>
              <p>
                This review fixture has captured the intended welcome state.
                Live Customer Account and consent wiring remain a Shopify
                integration gate.
              </p>
              <button
                type="button"
                className="cp-member-button"
                onClick={() => setJoined(false)}
              >
                Review the form again
              </button>
            </div>
          ) : (
            <form className="cp-member-form" onSubmit={handleSubmit}>
              <h2>Join before the next release.</h2>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </label>
              <label>
                First name <span>(optional)</span>
                <input
                  name="firstName"
                  type="text"
                  placeholder="Your first name"
                />
              </label>
              <label className="cp-member-checkbox">
                <input name="marketingConsent" type="checkbox" required />
                <span>
                  I want CP private-list updates. I can unsubscribe anytime.
                </span>
              </label>
              <button type="submit" className="cp-member-button">
                Join the private list
              </button>
              <p className="cp-member-form-footnote">
                Service/account communication and marketing consent will be
                stored separately when the live integration is enabled.
              </p>
            </form>
          )}
        </div>
      </section>

      <section
        className="cp-member-section"
        aria-labelledby="member-benefits-title"
      >
        <div className="cp-member-section-heading">
          <p className="cp-member-section-label">02 / What membership means</p>
          <h2 id="member-benefits-title">Access before promotion.</h2>
        </div>
        <div className="cp-member-benefit-grid">
          {memberBenefits.map(([title, copy], index) => (
            <article className="cp-member-benefit cp-card-panel" key={title}>
              <p className="cp-member-index">0{index + 1}</p>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="cp-member-dashboard"
        aria-labelledby="member-dashboard-title"
      >
        <div className="cp-member-dashboard-header">
          <div>
            <p className="cp-member-section-label">03 / Account direction</p>
            <h2 id="member-dashboard-title">CP Member</h2>
          </div>
          <span className="cp-member-preview-badge">
            Private review fixture
          </span>
        </div>

        <div className="cp-member-card-row">
          <article
            className="cp-stone-card"
            aria-label="CP Member card preview"
          >
            <p>CP MEMBER</p>
            <div className="cp-stone-card-mark" aria-hidden="true">
              CP
            </div>
            <div className="cp-stone-card-footer">
              <span>PRIVATE PREVIEW</span>
              <span>NO. 000184</span>
            </div>
          </article>
          <div className="cp-member-profile cp-card-panel">
            <dl className="cp-member-definition-list">
              <div>
                <dt>Member since</dt>
                <dd>2026</dd>
              </div>
              <div>
                <dt>Preferred fit</dt>
                <dd>Relaxed</dd>
              </div>
              <div>
                <dt>Your CP size</dt>
                <dd>Not set</dd>
              </div>
              <div>
                <dt>Saved pieces</dt>
                <dd>0</dd>
              </div>
            </dl>
            <button type="button" className="cp-member-text-button">
              Complete your profile →
            </button>
          </div>
        </div>

        <div className="cp-member-lower-grid">
          <article className="cp-card-panel cp-member-ledger">
            <div className="cp-member-panel-heading">
              <div>
                <p className="cp-member-section-label">04 / CP Credit</p>
                <h3>Clear value, no points.</h3>
              </div>
              <strong>€15.00</strong>
            </div>
            <div className="cp-member-ledger-rows">
              {ledger.map(([label, amount, detail]) => (
                <div className="cp-member-ledger-row" key={label}>
                  <span>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                  <b>{amount}</b>
                </div>
              ))}
            </div>
          </article>
          <article className="cp-card-panel cp-member-saved">
            <p className="cp-member-section-label">05 / Saved Pieces</p>
            <h3>Keep a quiet record of what stays with you.</h3>
            <p>
              Your saved pieces, reservations, sizes, and restock alerts will
              live here.
            </p>
            <Link className="cp-member-text-button" href="/shop">
              Explore the collection →
            </Link>
          </article>
        </div>
      </section>

      <footer className="cp-member-footer">
        <p>CP Member is the beginning of the relationship.</p>
        <Link href="/">Return to CARLOPHILLIPS</Link>
      </footer>
    </main>
  );
}
