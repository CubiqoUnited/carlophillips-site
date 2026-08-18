import HomeStorefront from '@/components/storefront/home-storefront';
import { getServerCatalogDecision } from '@/lib/commerce/catalog-server';
import { toHomeCatalogSummary } from '@/lib/commerce/home-catalog-summary';
import { routeMetadata } from '@/lib/site/site-config';

export const metadata = routeMetadata({ title: 'CARLOPHILLIPS | Signature Series', description: 'A private review of the CARLOPHILLIPS Signature Series. Availability and checkout remain release-gated.', path: '/' });

export const dynamic = 'force-dynamic';

export default async function HomeRoute() {
  const catalogDecision = await getServerCatalogDecision();
  return <HomeStorefront catalogSummary={toHomeCatalogSummary(catalogDecision)} />;
}
