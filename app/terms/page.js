import { PolicyPage } from '@/components/privacy/policy-page';
import { policyContentApproved, routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'Terms | CARLOPHILLIPS', description: 'CARLOPHILLIPS site terms publication surface.', path: '/terms', index: policyContentApproved });

export default function TermsPage() {
  return <PolicyPage eyebrow="Terms" title="Site terms" reviewNote="Technical publication draft — commercial terms, governing terms, returns, support and seller identity require business and legal owner approval.">
    <section><h2>Site status</h2><p>Product previews do not guarantee availability. Purchasing remains unavailable unless the separate commerce release and checkout gates pass.</p></section>
    <section><h2>Product information</h2><p>Released product descriptions, variants, prices and availability are supplied by the approved commerce source. Visual presentation does not override that source.</p></section>
    <section><h2>Orders, returns and support</h2><p>Approved order, payment, delivery, returns, cancellation, support and dispute terms must be inserted by the accountable business and legal owners before checkout is enabled.</p></section>
  </PolicyPage>;
}
