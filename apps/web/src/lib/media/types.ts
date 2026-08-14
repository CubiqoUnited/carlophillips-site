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

export interface ViewerMediaItem extends ReleaseBoundMediaItem {
  src: string;
  disclosure: 'Release-bound product view';
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
