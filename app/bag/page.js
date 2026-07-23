import { CommerceBagState } from '@/components/commerce/bag-state';
import { resolveBagDecision } from '@/lib/commerce/bag-decision';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import { discoverCapability, getCapabilityRegistry } from '@/lib/orchestration/capability-registry';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bag | CARLOPHILLIPS',
  description: 'A source-labeled CARLOPHILLIPS bag state. Checkout remains fail-closed until commerce evidence passes.',
  robots: { index: false, follow: true },
};

export default function BagPage() {
  const environment = getCommerceEnvironment();
  const registry = getCapabilityRegistry();
  const cartCapability = discoverCapability(registry, 'shopify-storefront-cart', 'cart-write');
  const decision = resolveBagDecision({ environment, capabilityDecision: cartCapability });

  return <CommerceBagState decision={decision} />;
}
