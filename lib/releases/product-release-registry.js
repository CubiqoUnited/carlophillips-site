import hoodieMediaManifest from '../../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import hoodieRelease from '../../releases/cp-signature-hoodie-2026-001/release.json';

const RELEASE_EVIDENCE_BY_HANDLE = new Map([
  [hoodieRelease.shopify.handle, {
    releaseRecord: hoodieRelease,
    mediaManifest: hoodieMediaManifest,
  }],
]);

export function getProductReleaseEvidence(handle) {
  const evidence = RELEASE_EVIDENCE_BY_HANDLE.get(handle);
  return evidence ? structuredClone(evidence) : null;
}
