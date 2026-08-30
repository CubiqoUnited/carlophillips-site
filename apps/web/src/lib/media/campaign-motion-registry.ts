import motionRegistry from '../../../../../config/campaign-motion-registry.json';

export type CampaignMotionPlacement = 'landing-hero' | 'product-runway';

export interface ApprovedCampaignMotionAsset {
  assetId: string;
  placement: CampaignMotionPlacement;
  productHandle?: string;
  role?: 'hero-motion' | 'runway-motion' | 'fit-silhouette';
  sequence?: number;
  label?: string;
  playbackId: string;
  playbackUrl: string;
  posterUrl: string;
  approvalStatus: string;
  evidence: string;
}

export function getApprovedCampaignMotionAssets(
  placement: CampaignMotionPlacement,
  productHandle?: string
): ApprovedCampaignMotionAsset[] {
  return (motionRegistry.assets as ApprovedCampaignMotionAsset[])
    .filter(
      (asset) =>
        asset.placement === placement &&
        (!productHandle || asset.productHandle === productHandle) &&
        asset.approvalStatus === 'approved' &&
        Boolean(asset.playbackUrl) &&
        Boolean(asset.playbackId) &&
        Boolean(asset.posterUrl) &&
        Boolean(asset.evidence)
    )
    .sort((left, right) => (left.sequence || 0) - (right.sequence || 0));
}
