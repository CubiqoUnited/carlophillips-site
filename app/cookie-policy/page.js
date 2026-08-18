import { PolicyPage } from '@/components/privacy/policy-page';
import { policyContentApproved, routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'Cookie policy | CARLOPHILLIPS', description: 'Optional analytics and browser-storage choices on CARLOPHILLIPS.', path: '/cookie-policy', index: policyContentApproved });

export default function CookiePolicyPage() {
  return <PolicyPage eyebrow="Cookies" title="Cookie and storage choices" reviewNote="Technical publication draft — the final processor list and retention language require business and legal owner approval.">
    <section><h2>Essential storage</h2><p>The storefront uses only storage required for essential site operation.</p></section>
    <section><h2>First-party measurement</h2><p>Vercel Web Analytics and Speed Insights may measure public-page visits and performance without an advertising profile. Admin routes are excluded and page query strings are removed from recorded URLs.</p></section>
  </PolicyPage>;
}
