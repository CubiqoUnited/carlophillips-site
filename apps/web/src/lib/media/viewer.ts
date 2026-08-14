import { mapEligibleMedia } from './mapping';
import type { ReleaseBoundMediaItem, ViewerMediaItem } from './types';

export function buildMediaViewerProjection({
  media,
}: {
  media: Array<Partial<ReleaseBoundMediaItem>> | null | undefined;
  title?: string;
}): ViewerMediaItem[] {
  return mapEligibleMedia(media)
    .slice(0, 12)
    .map((item) => ({
      ...item,
      src: item.url || item.previewUrl,
      disclosure: 'Release-bound product view',
    }));
}
