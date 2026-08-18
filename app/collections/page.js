import { CommerceCatalogBoundary } from '@/components/commerce/catalog-boundary';
import { routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'Collections | CARLOPHILLIPS', description: 'Review the CARLOPHILLIPS collections. Product availability and checkout remain release-gated.', path: '/collections' });

export const dynamic = 'force-dynamic';

export default function CollectionsPage() {
  return <CommerceCatalogBoundary pageLabel="Collections" />;
}
