import { mapEligibleMedia } from './media';
import {
  CONSTRUCTION_DETAILS,
  MEDIA_SOURCE_AUTHORITIES,
  ON_BODY_POSES,
  PODPIPE_SECTION_IDS,
  type ApprovedCampaignAsset,
  type ConstructionDetail,
  type OnBodyPose,
  type PodpipeSection,
  type PodpipeSectionId,
  type ReleaseBoundMediaItem,
} from './types';

export interface PodpipeCommerceFacts {
  title: string;
  price: number;
  currency: string;
  availableForSale: boolean;
  sizes: string[];
  sizeGuide: string | null;
  bagAllowed: boolean;
  checkoutAllowed: boolean;
}

export interface PodpipeReleaseBinding {
  releaseId: string;
  handle: string;
  variantFingerprint: string;
  commerceFactsFingerprint: string;
  observationFingerprint: string;
}

export interface ReviewedPodpipeCommerce {
  approvalStatus: 'reviewed';
  sourceAuthority: 'reviewed-shopify-observation';
  binding: PodpipeReleaseBinding;
  data: PodpipeCommerceFacts;
}

export interface PodpipeFulfillmentFacts {
  production: string;
  delivery: string;
  care: string;
  returns: string;
  fulfillment: string;
}

export interface PodpipeInput {
  campaign?: ApprovedCampaignAsset | null;
  media?: Array<Partial<ReleaseBoundMediaItem>>;
  releaseBinding?: PodpipeReleaseBinding | null;
  commerce?: ReviewedPodpipeCommerce | null;
  fulfillment?: {
    approvalStatus: 'approved' | 'pending';
    sourceAuthority: 'approved-product-release-record';
    data: PodpipeFulfillmentFacts;
  } | null;
  model3dApplicable?: boolean;
}

const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;

function bindingsMatch(
  expected: PodpipeReleaseBinding | null | undefined,
  reviewed: ReviewedPodpipeCommerce | null | undefined
): boolean {
  if (
    !expected ||
    !reviewed ||
    reviewed.approvalStatus !== 'reviewed' ||
    reviewed.sourceAuthority !== 'reviewed-shopify-observation'
  ) {
    return false;
  }
  const actual = reviewed.binding;
  return (
    expected.releaseId.length > 0 &&
    expected.handle.length > 0 &&
    expected.releaseId === actual.releaseId &&
    expected.handle === actual.handle &&
    expected.variantFingerprint === actual.variantFingerprint &&
    expected.commerceFactsFingerprint === actual.commerceFactsFingerprint &&
    expected.observationFingerprint === actual.observationFingerprint &&
    FINGERPRINT_PATTERN.test(actual.variantFingerprint) &&
    FINGERPRINT_PATTERN.test(actual.commerceFactsFingerprint) &&
    FINGERPRINT_PATTERN.test(actual.observationFingerprint)
  );
}

const authorities = {
  'campaign-opening': MEDIA_SOURCE_AUTHORITIES.campaign,
  'product-alone': MEDIA_SOURCE_AUTHORITIES.release,
  'on-body-editorial': MEDIA_SOURCE_AUTHORITIES.release,
  'embroidery-detail': MEDIA_SOURCE_AUTHORITIES.release,
  'material-construction-story': MEDIA_SOURCE_AUTHORITIES.release,
  'product-motion': MEDIA_SOURCE_AUTHORITIES.release,
  'spin-360': MEDIA_SOURCE_AUTHORITIES.release,
  'model-3d': MEDIA_SOURCE_AUTHORITIES.release,
  'construction-details': MEDIA_SOURCE_AUTHORITIES.release,
  'shopify-facts': MEDIA_SOURCE_AUTHORITIES.commerce,
  'fulfillment-care-returns': MEDIA_SOURCE_AUTHORITIES.fulfillment,
} as const;

function mediaWithModality(
  media: ReleaseBoundMediaItem[],
  modality: string
): ReleaseBoundMediaItem[] {
  return media.filter((item) => item.modalities.includes(modality as never));
}

function hasEveryPose(media: ReleaseBoundMediaItem[]): boolean {
  const poses = new Set(
    media.map((item) => item.onBodyPose).filter(Boolean) as OnBodyPose[]
  );
  return ON_BODY_POSES.every((pose) => poses.has(pose));
}

function hasEveryConstructionDetail(media: ReleaseBoundMediaItem[]): boolean {
  const details = new Set(
    media
      .map((item) => item.constructionDetail)
      .filter(Boolean) as ConstructionDetail[]
  );
  return CONSTRUCTION_DETAILS.every((detail) => details.has(detail));
}

function section(
  id: PodpipeSectionId,
  assets: ReleaseBoundMediaItem[],
  data: Record<string, unknown> | null,
  blockers: string[],
  statusOverride?: PodpipeSection['status']
): PodpipeSection {
  return {
    id,
    position: PODPIPE_SECTION_IDS.indexOf(id) + 1,
    authority: authorities[id],
    status:
      statusOverride ||
      (blockers.length === 0 && (assets.length > 0 || data)
        ? 'available'
        : 'withheld'),
    assets,
    data,
    blockers,
  };
}

export function projectPodpipeSequence(
  input: PodpipeInput = {}
): PodpipeSection[] {
  const media = mapEligibleMedia(input.media);
  const front = mediaWithModality(media, 'front');
  const back = mediaWithModality(media, 'back-angle');
  const onBody = media.filter((item) =>
    item.modalities.some((modality) =>
      ['on-model', 'lifestyle'].includes(modality)
    )
  );
  const embroidery = mediaWithModality(media, 'embroidery-detail');
  const material = mediaWithModality(media, 'material-detail');
  const motion = mediaWithModality(media, 'video');
  const spin = mediaWithModality(media, 'spin-360');
  const model = mediaWithModality(media, 'model-3d-ar');
  const construction = media.filter((item) => item.constructionDetail);
  const motionRoles = new Set(motion.map((item) => item.motionRole));
  const campaignReady =
    input.campaign?.approvalStatus === 'approved' &&
    input.campaign.sourceAuthority === 'approved-campaign-registry';
  const commerceReady = bindingsMatch(input.releaseBinding, input.commerce);
  const commerceData = commerceReady ? input.commerce?.data : null;
  const fulfillmentReady =
    input.fulfillment?.approvalStatus === 'approved' &&
    input.fulfillment.sourceAuthority === 'approved-product-release-record';
  const fulfillmentData = fulfillmentReady ? input.fulfillment?.data : null;

  return [
    section(
      'campaign-opening',
      [],
      campaignReady && commerceData
        ? {
            asset: input.campaign,
            productName: commerceData.title,
            price: commerceData.price,
            currency: commerceData.currency,
          }
        : null,
      campaignReady && commerceData
        ? []
        : ['APPROVED_CAMPAIGN_AND_REVIEWED_COMMERCE_REQUIRED']
    ),
    section(
      'product-alone',
      [...front, ...back],
      null,
      front.length > 0 && back.length > 0
        ? []
        : ['CLEAN_FRONT_AND_BACK_REQUIRED']
    ),
    section(
      'on-body-editorial',
      onBody,
      null,
      hasEveryPose(onBody) ? [] : ['ALL_FIVE_ON_BODY_POSES_REQUIRED']
    ),
    section(
      'embroidery-detail',
      embroidery,
      null,
      embroidery.length > 0 ? [] : ['APPROVED_EMBROIDERY_DETAIL_REQUIRED']
    ),
    section(
      'material-construction-story',
      material,
      null,
      material.length > 0 ? [] : ['APPROVED_MATERIAL_STORY_REQUIRED']
    ),
    section(
      'product-motion',
      motion,
      null,
      motionRoles.has('film') && motionRoles.has('preview')
        ? []
        : ['APPROVED_FILM_AND_LIGHTWEIGHT_PREVIEW_REQUIRED']
    ),
    section(
      'spin-360',
      spin,
      null,
      spin.length > 0 ? [] : ['REAL_APPROVED_360_REQUIRED']
    ),
    section(
      'model-3d',
      model,
      null,
      input.model3dApplicable === false || model.length > 0
        ? []
        : ['VERIFIED_GLB_REQUIRED'],
      input.model3dApplicable === false ? 'not-applicable' : undefined
    ),
    section(
      'construction-details',
      construction,
      null,
      hasEveryConstructionDetail(construction)
        ? []
        : ['ALL_SIX_CONSTRUCTION_DETAILS_REQUIRED']
    ),
    section(
      'shopify-facts',
      [],
      commerceData ? { ...commerceData } : null,
      commerceData ? [] : ['REVIEWED_SHOPIFY_FACTS_REQUIRED']
    ),
    section(
      'fulfillment-care-returns',
      [],
      fulfillmentData ? { ...fulfillmentData } : null,
      fulfillmentReady ? [] : ['APPROVED_FULFILLMENT_FACTS_REQUIRED']
    ),
  ];
}

export function validatePodpipeSequence(sequence: PodpipeSection[]): {
  ready: boolean;
  blockers: Array<{ sectionId: PodpipeSectionId; blockers: string[] }>;
} {
  const orderValid =
    sequence.length === PODPIPE_SECTION_IDS.length &&
    sequence.every(
      (item, index) =>
        item.id === PODPIPE_SECTION_IDS[index] && item.position === index + 1
    );
  const blockers = sequence
    .filter((item) => item.status === 'withheld')
    .map((item) => ({ sectionId: item.id, blockers: item.blockers }));
  if (!orderValid) {
    blockers.unshift({
      sectionId: 'campaign-opening',
      blockers: ['PODPIPE_SEQUENCE_ORDER_INVALID'],
    });
  }
  return { ready: orderValid && blockers.length === 0, blockers };
}
