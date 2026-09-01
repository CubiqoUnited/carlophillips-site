'use client';

import { buildMediaViewerProjection } from '@/lib/media/viewer';
import type { ViewerMediaItem } from '@/lib/media/types';
import type { HomeCatalogSummary, HomeStorefrontProps } from '@/types';
import WorkbookReplica from '../WorkbookReplica';

export function buildHomeGalleryMedia(
  summary: HomeCatalogSummary | null | undefined
): ViewerMediaItem[] {
  const product = summary?.primaryProduct;
  if (!product || (summary?.visibleCount ?? 0) < 1) return [];

  return buildMediaViewerProjection({
    media: product.media,
    title: product.title || 'Product',
  });
}

export default function HomeStorefront({
  campaignAsset,
  catalogSummary,
}: HomeStorefrontProps) {
  return (
    <WorkbookReplica
      campaignAsset={campaignAsset}
      catalogSummary={catalogSummary}
    />
  );
}
