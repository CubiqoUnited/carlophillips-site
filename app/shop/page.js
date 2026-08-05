import { CommerceCatalogBoundary } from '@/components/commerce/catalog-boundary';

export const metadata = {
  title: 'Shop | CARLOPHILLIPS',
  description: 'Shop the live CARLOPHILLIPS collection through secure Shopify checkout.',
};

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  return <CommerceCatalogBoundary pageLabel="Shop" />;
}
