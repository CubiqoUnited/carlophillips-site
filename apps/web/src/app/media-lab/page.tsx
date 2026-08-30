import { notFound } from 'next/navigation';
import { SignatureHoodieMediaLab } from './signature-hoodie-media-lab';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Signature Hoodie Media Lab | CARLOPHILLIPS',
  description:
    'Private Draft-only media review for the CARLOPHILLIPS Signature Hoodie.',
  robots: { index: false, follow: false },
};

export default function MediaLabPage() {
  if (
    getCommerceEnvironment() !== 'local' &&
    process.env.NEXT_PUBLIC_STAGING_REVIEW !== 'true'
  )
    notFound();

  return <SignatureHoodieMediaLab />;
}
