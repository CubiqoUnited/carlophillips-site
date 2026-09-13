import Link from 'next/link';

export default function CheckoutConfirmPage() {
  return (
    <div className="cp-checkout-confirmation">
      <div className="cp-checkout-confirmation-banner">
        CHECKOUT CONTINUES WITH SHOPIFY
      </div>

      <main className="cp-checkout-confirmation-main cp-layout-centered">
        <div>
          <h1 className="text-3xl font-light mb-4">Checkout information</h1>
          <p className="cp-checkout-confirmation-muted cp-label">
            Shopify Checkout is the secure payment and order surface.
          </p>
        </div>

        <div className="cp-checkout-confirmation-panel">
          <h2 className="cp-checkout-confirmation-panel-title cp-label">
            Shopify-hosted checkout
          </h2>
          <p className="text-sm">
            Your cart, payment, and order status are confirmed only in Shopify
            Checkout and its order communications.
          </p>
          <p className="cp-checkout-confirmation-copy">
            This page does not create or confirm an order. For help after an
            order, use Aftercare.
          </p>
        </div>

        <div className="cp-checkout-confirmation-actions">
          <Link
            href="/"
            className="cp-action cp-checkout-confirmation-secondary"
          >
            Return to Storefront
          </Link>
          <Link
            href="/aftercare"
            className="cp-action cp-checkout-confirmation-primary"
          >
            Get aftercare help
          </Link>
        </div>
      </main>
    </div>
  );
}
