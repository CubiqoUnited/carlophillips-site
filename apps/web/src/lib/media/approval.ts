import { evaluateMediaRelease } from '../commerce/media-release-policy';
import { filterReleaseBoundMedia } from '../commerce/media-visibility-policy';
import type { ReleaseBoundMediaItem } from './types';
import type {
  MediaManifest as RuntimeMediaManifest,
  RuntimeProduct,
} from '../commerce/runtime-types';

interface MediaManifest {
  requirements?: unknown[];
  assets?: unknown[];
}

interface ProductWithMedia {
  media?: unknown[];
  [key: string]: unknown;
}

export interface ControlledMediaResult {
  status: 'eligible' | 'withheld';
  reason: 'CONTROLLED_MEDIA_ELIGIBLE' | 'CONTROLLED_MEDIA_INCOMPLETE';
  releaseReady: boolean;
  productionReady: boolean;
  media: ReleaseBoundMediaItem[];
  review: Record<string, unknown> | null;
}

export function evaluateControlledMedia({
  product,
  manifest,
  environment,
}: {
  product: ProductWithMedia;
  manifest: MediaManifest;
  environment: 'local' | 'preview' | 'production';
}): ControlledMediaResult {
  const runtimeManifest = manifest as unknown as RuntimeMediaManifest;
  const runtimeProduct = product as unknown as RuntimeProduct;
  const release = evaluateMediaRelease(runtimeManifest);
  const projection = filterReleaseBoundMedia({
    product: runtimeProduct,
    manifest: runtimeManifest,
  });
  const production = environment === 'production';
  const visible = production
    ? release.ready && projection.productionReady
    : true;

  return {
    status: visible ? 'eligible' : 'withheld',
    reason: visible
      ? 'CONTROLLED_MEDIA_ELIGIBLE'
      : 'CONTROLLED_MEDIA_INCOMPLETE',
    releaseReady: release.ready,
    productionReady: projection.productionReady,
    media: visible ? projection.product.media : [],
    review: projection.product.mediaReview || null,
  };
}
