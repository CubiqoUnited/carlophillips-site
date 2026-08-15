import { PolicyPage } from '@/components/privacy/policy-page';
import { policyContentApproved, routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'Cookie policy | CARLOPHILLIPS', description: 'Optional analytics and browser-storage choices on CARLOPHILLIPS.', path: '/cookie-policy', index: policyContentApproved });

export default function CookiePolicyPage() {
  return <PolicyPage eyebrow="Cookies" title="Cookie and storage choices" reviewNote="Technical publication draft — the final processor list and retention language require business and legal owner approval.">
    <section><h2>Essential storage</h2><p>The storefront uses only storage required for essential site operation.</p></section>
    <section><h2>Optional analytics</h2><p>Optional analytics is currently disabled, so no analytics preference is stored and no consent prompt is displayed.</p></section>
  </PolicyPage>;
}
