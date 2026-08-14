import campaignRegistry from '../../../../../config/campaign-media-registry.json';
import type { ApprovedCampaignAsset } from './types';

const CAMPAIGN_ALT =
  'CARLOPHILLIPS runway campaign staged against a dramatic coastal mountain landscape';

export function getApprovedCampaignAsset(
  assetId: string
): ApprovedCampaignAsset | null {
  const asset = campaignRegistry.assets.find(
    (candidate) => candidate.assetId === assetId
  );
  if (
    !asset ||
    asset.approvalStatus !== 'approved' ||
    !asset.publicPath.startsWith('/media/') ||
    !/^[a-f0-9]{64}$/.test(asset.sha256) ||
    !asset.evidence
  ) {
    return null;
  }

  return {
    assetId: asset.assetId,
    src: asset.publicPath,
    alt: CAMPAIGN_ALT,
    approvalStatus: 'approved',
    sourceAuthority: 'approved-campaign-registry',
  };
}
