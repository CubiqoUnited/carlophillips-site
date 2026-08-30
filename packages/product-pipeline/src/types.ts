export const PRODUCT_RELEASE_STATES = [
  'draft',
  'staged',
  'approved',
  'released',
  'withdrawn',
] as const;

export type ReleaseState = (typeof PRODUCT_RELEASE_STATES)[number];

export interface Blocker {
  code: string;
  humanAction: string;
  resumePoint: string;
}

export interface ReleaseApproval {
  status: string;
  owner?: string;
}

export interface ProductReleaseRecord {
  schemaVersion?: 'cp.product-release.v1';
  releaseId: string;
  state: ReleaseState;
  shopify: {
    productReference?: string;
    handle: string;
    statusObserved?: string;
    observedAt?: string;
    variantFingerprint?: string;
    variantFingerprintStatus?: string;
    commerceFactsFingerprint?: string;
    commerceFactsFingerprintStatus?: string;
    observationFingerprint?: string;
    observationFingerprintStatus?: string;
    observationReviewEvidence?: string;
    [key: string]: unknown;
  };
  fulfillmentMappings: Array<{
    adapter?: string;
    providerProductId?: string;
    variantFingerprintStatus?: string;
    variantFingerprint?: string | null;
    [key: string]: unknown;
  }>;
  candidate: {
    gitCommit?: string | null;
    buildEvidence?: string | null;
    stagingEvidence?: string | null;
    responsiveEvidence?: string | null;
    performanceEvidence?: string | null;
    tokenEvidence?: string | null;
    shopifyMediaFingerprint?: string | null;
    shopifyMediaEvidence?: string | null;
    releaseEvidenceFingerprint?: string | null;
  };
  rollback: {
    strategy?: string | null;
    planEvidence?: string | null;
    previousReleaseId?: string | null;
    verificationEvidence?: string | null;
  };
  physicalSample?: {
    status?: string;
    sampleReference?: string | null;
    evidence?: string | null;
    fit?: string;
    colour?: string;
    artworkPlacement?: string;
    finish?: string;
  } | null;
  approvals: Record<'product' | 'media' | 'fulfillment', ReleaseApproval>;
  mediaManifest?: string;
  [key: string]: unknown;
}

export type ReleaseRecord = ProductReleaseRecord;

export interface MediaAsset {
  assetId: string;
  kind: string;
  approvalStatus?: string;
  exactProductMatch?: string;
  rightsStatus?: string;
  publicPath?: string;
  alt?: string;
  modalities?: string[];
  onBodyPose?: string;
  constructionDetail?: string;
  motionRole?: string;
  fallbackAssetId?: string | null;
  quality?: { status?: string; evidence?: string | null };
  source?: { type?: string; [key: string]: unknown };
  storefrontBinding?: {
    adapter?: string;
    referenceHash?: string;
    evidence?: string;
  } | null;
  spinEvidence?: {
    sourceType?: string;
    frameCount?: number;
    rotationTestEvidence?: string;
  };
  modelEvidence?: {
    formats?: string[];
    loadTestEvidence?: string;
    arClaimed?: boolean;
    arTestEvidence?: string;
  };
  presentation?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MediaRequirement {
  modality: string;
  requirement: string;
  status: string;
  assetIds: string[];
  infeasibilityBlocker?: {
    reason?: string;
    approvalStatus?: string;
    owner?: string;
  } | null;
}

export interface ProductMediaManifest {
  schemaVersion?: 'cp.product-media-manifest.v1';
  releaseId: string;
  requirements: MediaRequirement[];
  assets: MediaAsset[];
  [key: string]: unknown;
}

export type MediaManifest = ProductMediaManifest;

export interface ReleaseEvidence {
  releaseRecord: ProductReleaseRecord;
  mediaManifest: ProductMediaManifest;
}

export const CUSTOMER_MEDIA_TYPES = [
  'image',
  'video',
  'external_video',
  'model_3d',
  'spin',
] as const;

export type CustomerMediaType = (typeof CUSTOMER_MEDIA_TYPES)[number];

export const PRODUCT_MEDIA_MODALITIES = [
  'front',
  'back-angle',
  'embroidery-detail',
  'material-detail',
  'on-model',
  'lifestyle',
  'spin-360',
  'model-3d-ar',
  'video',
] as const;

export type ProductMediaModality = (typeof PRODUCT_MEDIA_MODALITIES)[number];

export const ON_BODY_POSES = [
  'front',
  'three-quarter',
  'profile',
  'seated',
  'back',
] as const;

export type OnBodyPose = (typeof ON_BODY_POSES)[number];

export const CONSTRUCTION_DETAILS = [
  'hood',
  'pocket',
  'seams',
  'cuffs',
  'waistband',
  'branding',
] as const;

export type ConstructionDetail = (typeof CONSTRUCTION_DETAILS)[number];

export const PODPIPE_SECTION_IDS = [
  'campaign-opening',
  'product-alone',
  'on-body-editorial',
  'embroidery-detail',
  'material-construction-story',
  'product-motion',
  'spin-360',
  'model-3d',
  'construction-details',
  'shopify-facts',
  'fulfillment-care-returns',
] as const;

export type PodpipeSectionId = (typeof PODPIPE_SECTION_IDS)[number];

export const MEDIA_SOURCE_AUTHORITIES = {
  campaign: 'approved-campaign-registry',
  release: 'product-release-media-registry',
  commerce: 'reviewed-shopify-observation',
  fulfillment: 'approved-product-release-record',
} as const;

export type MediaSourceAuthority =
  (typeof MEDIA_SOURCE_AUTHORITIES)[keyof typeof MEDIA_SOURCE_AUTHORITIES];

export interface ReleaseBoundMediaItem {
  id: string;
  registryAssetId: string;
  approvalStatus: 'approved';
  sourceAuthority: 'product-release-media-registry';
  type: CustomerMediaType;
  url: string;
  previewUrl: string;
  alt: string;
  label: string;
  modalities: ProductMediaModality[];
  onBodyPose?: OnBodyPose;
  constructionDetail?: ConstructionDetail;
  motionRole?: 'film' | 'preview';
}

export interface ViewerMediaItem {
  id: string;
  registryAssetId: string;
  approvalStatus: 'approved' | 'staging-review';
  sourceAuthority:
    | 'product-release-media-registry'
    | 'shopify-canonical-staging'
    | 'shopify-staging-approved-snapshot';
  type: CustomerMediaType;
  url: string;
  previewUrl: string;
  alt: string;
  label: string;
  modalities: ProductMediaModality[];
  onBodyPose?: OnBodyPose;
  constructionDetail?: ConstructionDetail;
  motionRole?: 'film' | 'preview';
  src: string;
  disclosure: 'Release-bound product view' | 'Shopify staging product view';
}

export interface ApprovedCampaignAsset {
  assetId: string;
  src: string;
  alt: string;
  approvalStatus: 'approved';
  sourceAuthority: 'approved-campaign-registry';
}

export interface PodpipeSection {
  id: PodpipeSectionId;
  position: number;
  authority: MediaSourceAuthority;
  status: 'available' | 'withheld' | 'not-applicable';
  assets: ReleaseBoundMediaItem[];
  data: Record<string, unknown> | null;
  blockers: string[];
}
