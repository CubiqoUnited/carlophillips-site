import { CommerceBagState } from '@/components/commerce/bag-state';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import type { BagDecision, CommerceEnvironment } from '@/types';
import { cookies } from 'next/headers';
import { readShopifyCart } from '@/lib/commerce/shopify-cart-server';

const readCommerceEnvironment =
  getCommerceEnvironment as () => CommerceEnvironment;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bag | CARLOPHILLIPS',
  description: 'Your Shopify-backed CARLOPHILLIPS bag and checkout.',
  robots: { index: false, follow: true },
};

export default async function BagPage({
  searchParams,
}: {
  searchParams?: Promise<{ added?: string }>;
}) {
  const environment = readCommerceEnvironment();
  let cart = null;
  let available = true;
  try {
    const cartId = (await cookies()).get('cp_shopify_cart')?.value || null;
    cart = await readShopifyCart({ cartId, environment });
  } catch {
    cart = null;
    available = false;
  }
  const localFixture =
    environment === 'local' && process.env.COMMERCE_DATA_MODE === 'fixture';
  const decision: BagDecision = localFixture
    ? {
        schemaVersion: 'cp.bag-decision.v1',
        status: 'local_preview',
        source: 'fixture',
        environment,
        commerceAllowed: false,
        checkoutAllowed: false,
        reason: 'LOCAL_NON_COMMERCE_FIXTURE',
        cart: null,
      }
    : {
        schemaVersion: 'cp.bag-decision.v1',
        status: !available ? 'unavailable' : cart ? 'ready' : 'empty',
        source: available ? 'shopify' : 'unavailable',
        environment,
        commerceAllowed: available,
        checkoutAllowed: available,
        reason: available
          ? 'SHOPIFY_CART_AUTHORITY'
          : 'SHOPIFY_CART_UNAVAILABLE',
        cart,
      };

  const added = (await searchParams)?.added === '1';
  return <CommerceBagState decision={decision} cart={cart} added={added} />;
}
