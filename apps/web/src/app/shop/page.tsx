import { CommerceCatalogBoundary } from '@/components/commerce/catalog-boundary';

export const metadata = {
  title: 'Shop | CARLOPHILLIPS',
  description:
    'Explore the current CARLOPHILLIPS collection and product studies.',
};

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  return <CommerceCatalogBoundary pageLabel="Shop" />;
}
