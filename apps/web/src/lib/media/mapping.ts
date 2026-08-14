import {
  CUSTOMER_MEDIA_TYPES,
  type CustomerMediaType,
  type ProductMediaModality,
  type ReleaseBoundMediaItem,
} from './types';

const allowedTypes = new Set<string>(CUSTOMER_MEDIA_TYPES);

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function safeSource(value: unknown): string {
  if (!hasText(value)) return '';
  const source = value.trim();
  if (source.startsWith('/media/')) return source;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function isModalityArray(value: unknown): value is ProductMediaModality[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string')
  );
}

export function mapEligibleMediaItem(
  item: Partial<ReleaseBoundMediaItem> | null | undefined
): ReleaseBoundMediaItem | null {
  if (
    !item ||
    item.approvalStatus !== 'approved' ||
    item.sourceAuthority !== 'product-release-media-registry' ||
    !hasText(item.registryAssetId) ||
    !hasText(item.id) ||
    !allowedTypes.has(item.type || '') ||
    !isModalityArray(item.modalities)
  ) {
    return null;
  }

  const url = safeSource(item.url);
  const previewUrl = safeSource(item.previewUrl || item.url);
  if (!url && !previewUrl) return null;

  return {
    ...item,
    id: item.id,
    registryAssetId: item.registryAssetId,
    approvalStatus: 'approved',
    sourceAuthority: 'product-release-media-registry',
    type: item.type as CustomerMediaType,
    url,
    previewUrl,
    alt: hasText(item.alt) ? item.alt : 'Approved product view',
    label: hasText(item.label) ? item.label : 'Approved product view',
    modalities: item.modalities,
  } as ReleaseBoundMediaItem;
}

export function mapEligibleMedia(
  media: Array<Partial<ReleaseBoundMediaItem>> | null | undefined
): ReleaseBoundMediaItem[] {
  const seen = new Set<string>();
  return (Array.isArray(media) ? media : [])
    .map((item) => mapEligibleMediaItem(item))
    .filter((item): item is ReleaseBoundMediaItem => Boolean(item))
    .filter((item) => {
      const identity = `${item.registryAssetId}:${item.type}:${item.url}:${item.previewUrl}`;
      if (seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
}
