import { CommerceCatalogBoundary } from '@/components/commerce/catalog-boundary';

export const metadata = {
  title: 'Collection | CARLOPHILLIPS',
  description: 'Explore the CARLOPHILLIPS collection, beginning with the Signature Hoodie.',
};

export const dynamic = 'force-dynamic';

export default function CollectionsPage() {
  return <CommerceCatalogBoundary pageLabel="Collections" />;
}
