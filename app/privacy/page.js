import { PolicyPage } from '@/components/privacy/policy-page';
import { policyContentApproved, routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'Privacy | CARLOPHILLIPS', description: 'How the CARLOPHILLIPS site handles visitor information and privacy choices.', path: '/privacy', index: policyContentApproved });

export default function PrivacyPage() {
  return <PolicyPage eyebrow="Privacy" title="Privacy at CARLOPHILLIPS" reviewNote="Technical publication draft — business and legal owner approval is required before production release.">
    <section><h2>What this site uses</h2><p>The storefront may use Vercel Web Analytics and Speed Insights for first-party page and performance measurement. Admin routes are excluded, query strings are removed before page events are sent, and no advertising tracker is connected.</p></section>
    <section><h2>Commerce data</h2><p>Product, availability, price, cart and checkout information comes from separately controlled commerce services. This page does not change those services or their release status.</p></section>
    <section><h2>Commerce measurement</h2><p>Shopify remains the source for checkout, order, conversion, revenue and payment reporting. CARLOPHILLIPS does not collect card details in the Next.js storefront.</p></section>
    <section><h2>Contact and retention</h2><p>Contact details, retention periods, processors and request procedures must be supplied and approved by the accountable business and legal owners before production publication.</p></section>
  </PolicyPage>;
}
