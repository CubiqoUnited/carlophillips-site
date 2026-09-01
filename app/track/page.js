import { OrderTracking } from '@/components/commerce/order-outcome';
import { routeMetadata } from '@/lib/site/site-config';

export const dynamic = 'force-dynamic';

export const metadata = routeMetadata({
  title: 'Track order | CARLOPHILLIPS',
  description: 'Follow the production and shipment status of a CARLOPHILLIPS order.',
  path: '/track',
  index: false,
});

export default async function TrackOrderPage({ searchParams }) {
  const params = await searchParams;
  const reference = typeof params?.order === 'string' ? params.order : '';
  return <OrderTracking orderReference={reference} />;
}
