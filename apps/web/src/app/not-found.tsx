import Link from 'next/link';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';

// KAN-22: Next's built-in 404 body is unbranded and the route previously
// answered 200 with internal vocabulary. A page that does not exist should say
// so, in the brand's voice, with a real 404 status.
export const metadata = {
  title: 'Page not found | CARLOPHILLIPS',
  description: 'This page is not available.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main id="main-content" className="cp-commerce-page">
      <StorefrontHeader fixed navigationAriaLabel="Navigation" />
      <section className="cp-section flex min-h-screen items-center pt-28">
        <div className="cp-shell-medium px-0">
          <p className="cp-label mb-8">CARLOPHILLIPS</p>
          <h1 className="cp-heading-section max-w-5xl">
            This page is not available.
          </h1>
          <p className="cp-body-large mt-10 max-w-2xl">
            The address may have changed. Return to the collection to see what
            is available now.
          </p>
          <Link href="/shop" className="cp-action cp-action-outline mt-10">
            Return to collection
          </Link>
        </div>
      </section>
    </main>
  );
}
