import { SupportForm } from '@/components/storefront/support-form';
import { routeMetadata } from '@/lib/site/site-config';

export const dynamic = 'force-dynamic';

export const metadata = routeMetadata({
  title: 'Contact us | CARLOPHILLIPS',
  description: 'Reach CARLOPHILLIPS support. We respond within one to two business days.',
  path: '/contact',
});

export default function ContactPage() {
  return <SupportForm />;
}
