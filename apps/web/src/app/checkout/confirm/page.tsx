import Link from 'next/link';

export default function CheckoutConfirmPage() {
  const orderNumber = `CP-STAGING-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white font-light">
      <div className="bg-white text-black text-center py-2 text-xs uppercase tracking-[0.2em] font-bold">
        STAGING ENVIRONMENT — NOT A REAL ORDER
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto w-full gap-8">
        <div>
          <h1 className="text-3xl font-light mb-4">Order Confirmed</h1>
          <p className="text-white/60 tracking-widest text-sm uppercase">
            Order #{orderNumber}
          </p>
        </div>

        <div className="border border-white/10 bg-white/5 p-8 w-full rounded flex flex-col gap-4 text-left">
          <h2 className="text-sm uppercase tracking-widest text-white/50 border-b border-white/10 pb-4">
            Simulated Fulfillment
          </h2>
          <p className="text-sm">
            A confirmation email has been dispatched to your staging address.
          </p>
          <p className="text-sm text-white/70">
            The fulfillment pipeline has been triggered in the staging
            environment. Inventory has been decremented and the warehouse proxy
            has acknowledged the shipment request.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/"
            className="flex-1 border border-white/30 h-12 flex items-center justify-center text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            Return to Storefront
          </Link>
          <Link
            href="/admin/orders"
            className="flex-1 bg-white text-black h-12 flex items-center justify-center text-xs uppercase tracking-widest hover:bg-white/90 transition-colors"
          >
            View in Admin Portal
          </Link>
        </div>
      </main>
    </div>
  );
}
