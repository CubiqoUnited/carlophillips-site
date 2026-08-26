import { PrivateList } from '@/components/storefront/private-list';
import { routeMetadata } from '@/lib/site/site-config';

export const dynamic = 'force-dynamic';

export const metadata = routeMetadata({
  title: 'Private list | CARLOPHILLIPS',
  description: 'Join the CARLOPHILLIPS private list for private releases, early access and selected notes.',
  path: '/private-list',
});

export default function PrivateListPage() {
  return <PrivateList />;
}
