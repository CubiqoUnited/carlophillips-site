import { PolicyPage } from '@/components/privacy/policy-page';
import { policyContentApproved, routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'Cookie policy | CARLOPHILLIPS', description: 'Optional analytics and browser-storage choices on CARLOPHILLIPS.', path: '/cookie-policy', index: policyContentApproved });

export default function CookiePolicyPage() {
  return <PolicyPage eyebrow="Cookies" title="Cookie and storage choices" reviewNote="Technical publication draft — the final processor list and retention language require business and legal owner approval.">
    <section><h2>Essential preference storage</h2><p><code>cp_optional_analytics_consent_v1</code> stores whether optional analytics was accepted or rejected. It is used only to remember your choice.</p></section>
    <section><h2>Optional analytics</h2><p>Optional analytics is off by default. When approved by the site owner and accepted by you, the site may measure page, collection, product and policy views using a restricted event schema without free-text or raw commerce identifiers.</p></section>
    <section><h2>Change your preference</h2><p>Use Cookie preferences at the bottom of any page to accept or reject optional analytics again.</p></section>
  </PolicyPage>;
}
