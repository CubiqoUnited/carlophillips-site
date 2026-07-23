import AppShell from '@/components/editorial/app-shell';
import { getServerCatalogDecision } from '@/lib/commerce/catalog-server';
import { toHomeCatalogSummary } from '@/lib/commerce/home-catalog-summary';

export const dynamic = 'force-dynamic';

export default async function HomeRoute() {
  const catalogDecision = await getServerCatalogDecision();
  return <AppShell homeCatalogSummary={toHomeCatalogSummary(catalogDecision)} />;
}
