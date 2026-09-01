import { CommerceBagState } from '@/components/commerce/bag-state';
import { resolveBagDecision } from '@/lib/commerce/bag-decision';
import { getServerCartActivationDecision } from '@/lib/commerce/cart-activation-server';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import { routeMetadata } from '@/lib/site/site-config';

export const dynamic = 'force-dynamic';

export const metadata = routeMetadata({ title: 'Bag | CARLOPHILLIPS', description: 'A source-labeled CARLOPHILLIPS bag state. Checkout remains fail-closed until commerce evidence passes.', path: '/bag', index: false });

export default function BagPage() {
  const environment = getCommerceEnvironment();
  const { decision: activationDecision } = getServerCartActivationDecision({ environment });
  const decision = resolveBagDecision({ environment, activationDecision });

  return <CommerceBagState decision={decision} />;
}
