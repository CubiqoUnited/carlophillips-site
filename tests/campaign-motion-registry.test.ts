import { describe, expect, it } from 'vitest';

import { getApprovedCampaignMotionAssets } from '../apps/web/src/lib/media/campaign-motion-registry';

describe('campaign motion registry', () => {
  it('returns the approved Signature Hoodie videos in presentation order', () => {
    const assets = getApprovedCampaignMotionAssets(
      'product-runway',
      'carlophillips-signature-hoodie'
    );

    expect(assets).toHaveLength(2);
    expect(assets.map((asset) => asset.role)).toEqual([
      'fit-silhouette',
      'runway-motion',
    ]);
    expect(assets.map((asset) => asset.sequence)).toEqual([1, 2]);
  });

  it('does not mix media from another product into the current product', () => {
    expect(
      getApprovedCampaignMotionAssets('product-runway', 'future-product')
    ).toEqual([]);
  });
});
