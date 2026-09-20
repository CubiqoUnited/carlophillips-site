import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import './checkout-design-review.css';

export const metadata = {
  title: 'Checkout Design Review | CARLOPHILLIPS',
  description:
    'Private internal review of the proposed CARLOPHILLIPS Shopify checkout direction.',
  robots: { index: false, follow: false },
};

const paymentMethods = [
  'Credit card',
  'Shop Pay',
  'PayPal',
  'Apple Pay',
  'Google Pay',
];

export default function CheckoutDesignReviewPage() {
  // Internal design-review surface. It is not a customer route and must never be
  // reachable on the live storefront. This guard is secondary to the
  // getCommerceEnvironment() fix in product-visibility.ts: the gate is what was
  // broken; this is defence in depth for one route that should never have been
  // publicly served (it returned 200 on www.carlophillips.com).
  if (getCommerceEnvironment() === 'production') {
    notFound();
  }

  return (
    <main id="main-content" className="cp-checkout-review">
      <header className="cp-checkout-review-header">
        <Link href="/" className="cp-checkout-review-brand">
          CARLOPHILLIPS
        </Link>
        <span className="cp-checkout-review-status">
          Internal review · Draft
        </span>
      </header>

      <section
        className="cp-checkout-review-intro"
        aria-labelledby="checkout-review-title"
      >
        <p className="cp-label">Shopify checkout direction</p>
        <h1 id="checkout-review-title" className="cp-heading-product">
          Payment design review
        </h1>
        <p className="cp-body cp-checkout-review-copy">
          Review the proposed black checkout direction before it is configured
          in Shopify. This page is visual approval only: it cannot create an
          order or collect payment.
        </p>
      </section>

      <section
        className="cp-checkout-review-methods"
        aria-labelledby="methods-title"
      >
        <div>
          <p className="cp-label">Proposed methods</p>
          <h2 id="methods-title" className="cp-checkout-review-heading">
            Wallets and cards
          </h2>
        </div>
        <ul className="cp-checkout-review-method-list">
          {paymentMethods.map((method) => (
            <li key={method}>{method}</li>
          ))}
        </ul>
      </section>

      <section
        className="cp-checkout-review-gallery"
        aria-label="Checkout concept screens"
      >
        <figure className="cp-checkout-review-figure cp-checkout-review-figure-desktop">
          <Image
            src="/review/payment-checkout/desktop-wallets-concept-v2.png"
            alt="Desktop CARLOPHILLIPS Shopify checkout concept showing card and wallet payment options."
            width={1920}
            height={1080}
            priority
          />
          <figcaption>Desktop concept</figcaption>
        </figure>
        <figure className="cp-checkout-review-figure cp-checkout-review-figure-mobile">
          <Image
            src="/review/payment-checkout/mobile-wallets-concept-v2.png"
            alt="Mobile CARLOPHILLIPS Shopify checkout concept showing card and wallet payment options."
            width={1080}
            height={1920}
          />
          <figcaption>Mobile concept</figcaption>
        </figure>
      </section>

      <section
        className="cp-checkout-review-note"
        aria-label="Implementation note"
      >
        <p className="cp-label">Implementation boundary</p>
        <p className="cp-body">
          Shopify controls payment security and which accelerated methods appear
          for each eligible device and customer. After approval, these visual
          settings are applied to a Shopify draft checkout configuration and
          tested without submitting a payment.
        </p>
      </section>
    </main>
  );
}
