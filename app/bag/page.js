import { CommerceBagState } from '@/components/commerce/bag-state';
import { resolveBagDecision } from '@/lib/commerce/bag-decision';
import { getServerCartActivationDecision } from '@/lib/commerce/cart-activation-server';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bag | CARLOPHILLIPS',
  description: 'A source-labeled CARLOPHILLIPS bag state. Checkout remains fail-closed until commerce evidence passes.',
  robots: { index: false, follow: true },
};

export default function BagPage() {
  const environment = getCommerceEnvironment();
  const { decision: activationDecision } = getServerCartActivationDecision({ environment });
  const decision = resolveBagDecision({ environment, activationDecision });

  return <CommerceBagState decision={decision} />;
}
