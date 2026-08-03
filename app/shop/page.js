import { CommerceCatalogBoundary } from '@/components/commerce/catalog-boundary';

export const metadata = {
  title: 'First Drop in Preparation | CARLOPHILLIPS',
  description: 'The first CARLOPHILLIPS release will appear after media, pricing, and fulfillment approval.',
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  return <CommerceCatalogBoundary pageLabel="Shop" />;
}
