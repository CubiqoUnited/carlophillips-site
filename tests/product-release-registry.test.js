import { describe, expect, it } from 'vitest';
import {
  getProductReleaseEvidence,
  listProductReleaseHandles,
} from '../lib/releases/product-release-registry.js';

describe('product release registry', () => {
  it('returns release-bound evidence only for a registered product handle', () => {
    const evidence = getProductReleaseEvidence('carlophillips-signature-hoodie');

    expect(evidence).toMatchObject({
      releaseRecord: {
        releaseId: 'cp-signature-hoodie-2026-001',
        state: 'draft',
        shopify: { handle: 'carlophillips-signature-hoodie' },
      },
      mediaManifest: {
        releaseId: 'cp-signature-hoodie-2026-001',
      },
    });
    expect(getProductReleaseEvidence('unregistered-product')).toBeNull();
  });

  it('returns a clone so route consumers cannot mutate registry truth', () => {
    const first = getProductReleaseEvidence('carlophillips-signature-hoodie');
    first.releaseRecord.state = 'released';

    expect(getProductReleaseEvidence('carlophillips-signature-hoodie').releaseRecord.state).toBe('draft');
  });

  it('enumerates only release-bound handles for reusable catalog resolution', () => {
    expect(listProductReleaseHandles()).toEqual(['carlophillips-signature-hoodie']);
  });
});
