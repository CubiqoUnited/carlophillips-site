import { PolicyPage } from '@/components/privacy/policy-page';
import { policyContentApproved, routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'Privacy | CARLOPHILLIPS', description: 'How the CARLOPHILLIPS site handles visitor information and privacy choices.', path: '/privacy', index: policyContentApproved });

export default function PrivacyPage() {
  return <PolicyPage eyebrow="Privacy" title="Privacy at CARLOPHILLIPS" reviewNote="Technical publication draft — business and legal owner approval is required before production release.">
    <section><h2>What this site uses</h2><p>Optional analytics is currently disabled. Essential site operation does not require an analytics preference prompt.</p></section>
    <section><h2>Commerce data</h2><p>Product, availability, price, cart and checkout information comes from separately controlled commerce services. This page does not change those services or their release status.</p></section>
    <section><h2>Your choices</h2><p>No optional analytics choice is requested or stored while analytics remains disabled.</p></section>
    <section><h2>Contact and retention</h2><p>Contact details, retention periods, processors and request procedures must be supplied and approved by the accountable business and legal owners before production publication.</p></section>
  </PolicyPage>;
}
