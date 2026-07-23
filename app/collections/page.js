import { CommerceCatalogBoundary } from '@/components/commerce/catalog-boundary';

export const metadata = {
  title: 'Collections in Preparation | CARLOPHILLIPS',
  description: 'CARLOPHILLIPS collections are withheld until approved release assets and product details are ready.',
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

export default function CollectionsPage() {
  return <CommerceCatalogBoundary pageLabel="Collections" />;
}
