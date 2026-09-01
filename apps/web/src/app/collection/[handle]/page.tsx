import { CommerceCatalogBoundary } from '@/components/commerce/catalog-boundary';

export const dynamic = 'force-dynamic';

export default async function CollectionRoute({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const label = handle
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');

  return <CommerceCatalogBoundary pageLabel={label || 'Collection'} />;
}
