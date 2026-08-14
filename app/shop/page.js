import { CommerceCatalogBoundary } from '@/components/commerce/catalog-boundary';
import { routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'Collection | CARLOPHILLIPS', description: 'Review the CARLOPHILLIPS collection. Product availability and checkout remain release-gated.', path: '/shop' });

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  return <CommerceCatalogBoundary pageLabel="Shop" />;
}
