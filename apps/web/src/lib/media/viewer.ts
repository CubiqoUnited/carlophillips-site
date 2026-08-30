import { mapEligibleMediaItem } from './mapping';
import {
  CUSTOMER_MEDIA_TYPES,
  PRODUCT_MEDIA_MODALITIES,
  type ReleaseBoundMediaItem,
  type ViewerMediaItem,
} from './types';

const customerMediaTypes = new Set<string>(CUSTOMER_MEDIA_TYPES);
const productMediaModalities = new Set<string>(PRODUCT_MEDIA_MODALITIES);

interface ViewerMediaInput {
  id?: unknown;
  registryAssetId?: unknown;
  approvalStatus?: unknown;
  sourceAuthority?: unknown;
  type?: unknown;
  url?: unknown;
  previewUrl?: unknown;
  alt?: unknown;
  label?: unknown;
  modalities?: unknown;
}

function safeMediaSource(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  const source = value.trim();
  if (source.startsWith('/media/')) return source;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function projectShopifyViewerItem(
  item: ViewerMediaInput
): ViewerMediaItem | null {
  const sourceAuthority = item.sourceAuthority;
  const approvalStatus = item.approvalStatus;
  const validAuthority =
    (sourceAuthority === 'shopify-canonical-staging' &&
      approvalStatus === 'staging-review') ||
    (sourceAuthority === 'shopify-staging-approved-snapshot' &&
      approvalStatus === 'approved');
  const type = typeof item.type === 'string' ? item.type : '';
  const id = typeof item.id === 'string' ? item.id.trim() : '';
  const url = safeMediaSource(item.url);
  const previewUrl = safeMediaSource(item.previewUrl || item.url);
  if (
    !validAuthority ||
    !id ||
    !customerMediaTypes.has(type) ||
    (!url && !previewUrl)
  )
    return null;

  const modalities = Array.isArray(item.modalities)
    ? item.modalities.filter(
        (value): value is ViewerMediaItem['modalities'][number] =>
          typeof value === 'string' && productMediaModalities.has(value)
      )
    : [];
  const src = url || previewUrl;
  return {
    id,
    registryAssetId:
      typeof item.registryAssetId === 'string' && item.registryAssetId.trim()
        ? item.registryAssetId
        : id,
    approvalStatus,
    sourceAuthority,
    type: type as ViewerMediaItem['type'],
    url,
    previewUrl,
    alt:
      typeof item.alt === 'string' && item.alt.trim()
        ? item.alt.trim()
        : 'Shopify product media',
    label:
      typeof item.label === 'string' && item.label.trim()
        ? item.label.trim()
        : 'Shopify product media',
    modalities,
    src,
    disclosure:
      approvalStatus === 'staging-review'
        ? 'Shopify staging product view'
        : 'Release-bound product view',
  };
}

export function buildMediaViewerProjection({
  media,
}: {
  media: ViewerMediaInput[] | null | undefined;
  title?: string;
}): ViewerMediaItem[] {
  const seen = new Set<string>();
  return (Array.isArray(media) ? media : [])
    .map((item) => {
      const releaseBound = mapEligibleMediaItem(
        item as Partial<ReleaseBoundMediaItem>
      );
      return releaseBound
        ? ({
            ...releaseBound,
            src: releaseBound.url || releaseBound.previewUrl,
            disclosure: 'Release-bound product view',
          } as ViewerMediaItem)
        : projectShopifyViewerItem(item);
    })
    .filter((item): item is ViewerMediaItem => Boolean(item))
    .filter((item) => {
      const identity = `${item.sourceAuthority}:${item.id}:${item.type}:${item.src}`;
      if (seen.has(identity)) return false;
      seen.add(identity);
      return true;
    })
    .slice(0, 24);
}
