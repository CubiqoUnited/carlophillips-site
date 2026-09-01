import { OrderConfirmation } from '@/components/commerce/order-outcome';
import { routeMetadata } from '@/lib/site/site-config';

export const dynamic = 'force-dynamic';

export const metadata = routeMetadata({
  title: 'Order confirmed | CARLOPHILLIPS',
  description: 'Your CARLOPHILLIPS order confirmation and next steps.',
  path: '/checkout/confirmation',
  index: false,
});

export default async function OrderConfirmationPage({ searchParams }) {
  const params = await searchParams;
  const reference = typeof params?.order === 'string' ? params.order : '';
  return <OrderConfirmation orderReference={reference} />;
}
