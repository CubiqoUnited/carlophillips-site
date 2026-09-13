import { CommerceCatalogBoundary } from '@/components/commerce/catalog-boundary';

export const metadata = {
  title: 'Shop | CARLOPHILLIPS',
  description:
    'Explore the current CARLOPHILLIPS collection and product studies.',
};

export const dynamic = 'force-dynamic';

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ product?: string }>;
}) {
  const productHandle = (await searchParams)?.product;
  return (
    <CommerceCatalogBoundary
      pageLabel="Shop"
      discoveryOverlay={!productHandle}
      productHandle={productHandle}
    />
  );
}
