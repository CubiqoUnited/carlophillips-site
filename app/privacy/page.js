import { PolicyPage } from '@/components/privacy/policy-page';
import { policyContentApproved, routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'Privacy | CARLOPHILLIPS', description: 'How the CARLOPHILLIPS site handles visitor information and privacy choices.', path: '/privacy', index: policyContentApproved });

export default function PrivacyPage() {
  return <PolicyPage eyebrow="Privacy" title="Privacy at CARLOPHILLIPS" reviewNote="Technical publication draft — business and legal owner approval is required before production release.">
    <section><h2>What this site uses</h2><p>The site uses essential browser storage to remember your optional analytics choice. Optional analytics is disabled by default and loads only after an affirmative choice in an approved environment.</p></section>
    <section><h2>Commerce data</h2><p>Product, availability, price, cart and checkout information comes from separately controlled commerce services. This page does not change those services or their release status.</p></section>
    <section><h2>Your choices</h2><p>You can reject optional analytics or change your preference at any time through Cookie preferences.</p></section>
    <section><h2>Contact and retention</h2><p>Contact details, retention periods, processors and request procedures must be supplied and approved by the accountable business and legal owners before production publication.</p></section>
  </PolicyPage>;
}
