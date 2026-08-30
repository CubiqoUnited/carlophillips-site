import hoodieMediaManifest from '../../../../../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import hoodieRelease from '../../../../../releases/cp-signature-hoodie-2026-001/release.json';
import type {
  MediaManifest,
  ReleaseEvidence,
  ReleaseRecord,
} from '../commerce/runtime-types';

const RELEASE_EVIDENCE_BY_HANDLE = new Map<string, ReleaseEvidence>([
  [hoodieRelease.shopify.handle, {
    releaseRecord: hoodieRelease as unknown as ReleaseRecord,
    mediaManifest: hoodieMediaManifest as unknown as MediaManifest,
  }],
]);

export function getProductReleaseEvidence(handle: string): ReleaseEvidence | null {
  const evidence = RELEASE_EVIDENCE_BY_HANDLE.get(handle);
  return evidence ? structuredClone(evidence) : null;
}

export function listProductReleaseHandles(): string[] {
  return [...RELEASE_EVIDENCE_BY_HANDLE.keys()];
}
