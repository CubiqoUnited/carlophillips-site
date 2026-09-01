import { CheckoutExperience } from '@/components/commerce/checkout-experience';
import { routeMetadata } from '@/lib/site/site-config';

export const dynamic = 'force-dynamic';

export const metadata = routeMetadata({
  title: 'Checkout | CARLOPHILLIPS',
  description: 'Complete your CARLOPHILLIPS order. Payment is handled by the secure hosted checkout.',
  path: '/checkout',
  index: false,
});

export default function CheckoutPage() {
  return <CheckoutExperience />;
}
