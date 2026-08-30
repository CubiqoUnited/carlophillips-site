import { CommerceBagState } from '@/components/commerce/bag-state';
import { resolveBagDecision } from '@/lib/commerce/bag-decision';
import { getServerCartActivationDecision } from '@/lib/commerce/cart-activation-server';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import type {
  BagDecision,
  CartActivationSummary,
  CommerceEnvironment,
} from '@/types';

const readCommerceEnvironment =
  getCommerceEnvironment as () => CommerceEnvironment;
const readCartActivation = getServerCartActivationDecision as (input: {
  environment: CommerceEnvironment;
}) => { decision: unknown; summary: CartActivationSummary };
const decideBag = resolveBagDecision as (input: {
  environment: CommerceEnvironment;
  activationDecision: unknown;
}) => BagDecision;

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bag | CARLOPHILLIPS',
  description:
    'A source-labeled CARLOPHILLIPS bag state. Checkout remains fail-closed until commerce evidence passes.',
  robots: { index: false, follow: true },
};

export default function BagPage() {
  const environment = readCommerceEnvironment();
  const { decision: activationDecision } = readCartActivation({ environment });
  const decision = decideBag({ environment, activationDecision });

  return <CommerceBagState decision={decision} />;
}
