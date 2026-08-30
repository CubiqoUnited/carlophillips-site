import { permanentRedirect } from 'next/navigation';

export default async function LegacyProductRoute({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  permanentRedirect(`/product/${encodeURIComponent(handle)}`);
}
