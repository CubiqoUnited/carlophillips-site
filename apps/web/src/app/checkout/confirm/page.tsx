import Link from 'next/link';

export default function CheckoutConfirmPage() {
  return (
    <div className="cp-checkout-confirmation">
      <div className="cp-checkout-confirmation-banner">
        STAGING ENVIRONMENT — NOT A REAL ORDER
      </div>

      <main className="cp-checkout-confirmation-main cp-layout-centered">
        <div>
          <h1 className="text-3xl font-light mb-4">
            Checkout rehearsal complete
          </h1>
          <p className="cp-checkout-confirmation-muted cp-label">
            No order was created
          </p>
        </div>

        <div className="cp-checkout-confirmation-panel">
          <h2 className="cp-checkout-confirmation-panel-title cp-label">
            Private staging evidence
          </h2>
          <p className="text-sm">
            The selected release-bound product, size, and quantity passed the
            staging checkout boundary.
          </p>
          <p className="cp-checkout-confirmation-copy">
            Shopify cart creation, payment, inventory, email, order, and
            fulfillment were not invoked. Those actions occur only in the
            authorized Production checkout.
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
            href="/admin/orders"
            className="cp-action cp-checkout-confirmation-primary"
          >
            View in Admin Portal
          </Link>
        </div>
      </main>
    </div>
  );
}
