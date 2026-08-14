import type { ViewerMediaItem } from '../media/types';

export type CommerceEnvironment = 'local' | 'preview' | 'production';
export type CommerceMode = 'fixture' | 'shopify';
export type CommerceSource = CommerceMode | 'unavailable';
export type ReleaseState =
  'draft' | 'staged' | 'approved' | 'released' | 'withdrawn';

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ObservedVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  selectedOptions: SelectedOption[];
}

export interface CanonicalVariant {
  referenceHash: string;
  title: string;
  selectedOptions: SelectedOption[];
  availableForSale: boolean;
  price: { amount: string; currency: string };
}

export interface VariantPresentation {
  schemaVersion: 'cp.variant-presentation.v1';
  source: 'reviewed-product-observation';
  variantFingerprint: string;
  currency: string;
  selectionAllowed: false;
  cartAuthority: false;
  optionNames: string[];
  combinations: CanonicalVariant[];
}

export interface ProductFacts {
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tagline: string;
  details: string[];
  currency: string;
  minimumPrice: number;
  maximumPrice: number;
  availableForSale: boolean;
}

export interface ProductObservation {
  schemaVersion: 'cp.product-observation.v1';
  source: 'shopify' | 'fixture' | 'simulation';
  authority: 'candidate' | 'non_authoritative';
  environment: CommerceEnvironment;
  observedAt: string;
  capabilityEvidence: string | null;
  product: ProductFacts;
  variants: CanonicalVariant[];
  variantFingerprint: string;
  commerceFactsFingerprint: string;
  observationFingerprint: string;
  review: {
    status: 'pending' | 'approved';
    owner: 'Product Owner/designee';
    evidence: string | null;
  };
}

export interface RuntimeMedia {
  id?: string;
  registryAssetId?: string;
  rawReference?: string;
  type?: string;
  url?: string;
  src?: string;
  previewUrl?: string;
  alt?: string;
  label?: string;
  approvalStatus?: string;
  sourceAuthority?: string;
  modalities?: string[];
  onBodyPose?: string;
  constructionDetail?: string;
  motionRole?: string;
}

export interface RuntimeProduct {
  id: string;
  handle: string;
  shopifyId?: string;
  name?: string;
  title?: string;
  collection?: string;
  price?: number | string;
  compareAtPrice?: number | string;
  currency?: string;
  color?: string;
  tagline?: string;
  description?: string;
  details?: string[] | string[][];
  images?: string[];
  media?: RuntimeMedia[];
  heroImage?: string;
  variants?: { colors?: string[]; sizes?: string[] };
  sizes?: string[];
  observedVariants?: ObservedVariant[];
  availableForSale?: boolean;
  vendor?: string;
  productType?: string;
  category?: string;
  tags?: string[];
  observation?: ProductObservation;
  variantFingerprint?: string;
  commerceFactsFingerprint?: string;
  observationFingerprint?: string;
  variantPresentation?: VariantPresentation | null;
  mediaReview?: { status: string; missingModalities: string[] } | null;
  source?: string;
  commerceMode?: string;
  allowedEnvironment?: string;
  decoration?: string;
  line?: string;
  statusLabel?: string;
  story?: string;
}

export interface ReleaseDecision {
  schemaVersion: 'cp.release-decision.v1';
  environment: CommerceEnvironment;
  status: 'available' | 'unavailable' | 'denied';
  source: CommerceSource;
  visibilityAllowed: boolean;
  commerceAllowed: boolean;
  reason: string;
  product: RuntimeProduct | null;
}

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
  fallbackAssetId?: string;
  quality?: { status?: string; evidence?: string };
  source?: { type?: string };
  storefrontBinding?: {
    adapter?: string;
    referenceHash?: string;
    evidence?: string;
  };
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
  infeasibilityBlocker?: { approvalStatus?: string };
}

export interface MediaManifest {
  releaseId: string;
  requirements: MediaRequirement[];
  assets: MediaAsset[];
  [key: string]: unknown;
}

export interface ReleaseRecord {
  releaseId: string;
  state: ReleaseState;
  shopify: {
    handle: string;
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
    variantFingerprintStatus?: string;
    variantFingerprint?: string | null;
  }>;
  candidate: {
    gitCommit?: string | null;
    buildEvidence?: string | null;
    stagingEvidence?: string | null;
    responsiveEvidence?: string | null;
    performanceEvidence?: string | null;
    tokenEvidence?: string | null;
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
  approvals: Record<'product' | 'media' | 'fulfillment', { status: string }>;
  [key: string]: unknown;
}

export interface ReleaseEvidence {
  releaseRecord: ReleaseRecord;
  mediaManifest: MediaManifest;
}

export interface Blocker {
  code: string;
  humanAction: string;
  resumePoint: string;
}

export interface CapabilityEntry {
  capability: string;
  accessState: string;
  selectedAdapter: string | null;
  callableSurface: string;
  evidenceRef?: string | null;
  allowedOperations: string[];
  blocker?: Blocker | null;
}

export interface CapabilityRegistry {
  capabilities: CapabilityEntry[];
  [key: string]: unknown;
}

export interface CapabilityDecision {
  status: 'ready' | 'unavailable' | 'human_required';
  capability: string;
  adapter: string | null;
  callableSurface: string;
  evidenceRef: string | null;
  reason: string | null;
  blocker: Blocker | null;
}

export interface CartActivationSummary {
  schemaVersion: 'cp.cart-activation-decision.v1';
  status: 'disabled' | 'blocked' | 'eligible';
  cartAllowed: boolean;
  checkoutAllowed: false;
  reason: string;
  checkoutReason: string;
  prerequisites: Array<{
    code: string;
    status: 'satisfied' | 'blocked' | 'human_required';
    resumePoint: string | null;
  }>;
}

export interface CartActivationDecision extends CartActivationSummary {
  environment: CommerceEnvironment;
  productHandle: string | null;
}

export interface VariantResolutionDecision {
  schemaVersion: 'cp.variant-resolution-decision.v1';
  environment: CommerceEnvironment;
  status: 'ready' | 'blocked';
  capability: string;
  adapter: string;
  callableSurface: string;
  productHandle: string | null;
  variantFingerprint: string | null;
  evidenceRef: string | null;
  productReadEvidenceRef: string | null;
  mappedVariantCount: number;
  mappingComplete: boolean;
  rawReferenceExposed: boolean;
  cartMutationAuthorized: boolean;
  checkoutAuthorized: boolean;
  blockers: Blocker[];
}

export interface CatalogDecision {
  schemaVersion: 'cp.catalog-decision.v1';
  environment: CommerceEnvironment;
  status: 'available' | 'unavailable' | 'denied';
  source: CommerceSource;
  candidateCount: number;
  visibleCount: number;
  excludedCount: number;
  commerceAllowed: boolean;
  reason: string;
  excludedReasons: string[];
  products: ProductViewModel[];
}

export interface ProductViewModel extends RuntimeProduct {
  source: CommerceSource;
  sourceLabel: string;
  commerceAllowed: boolean;
  reason: string;
  title: string;
  price: number;
  currency: string;
  description: string;
  tagline: string;
  story: string;
  truthHeading: string;
  commerceExplanation: string;
  colors: string[];
  sizes: string[];
  variantPresentation: VariantPresentation | null;
  availableForSale: boolean;
  vendor: string;
  productType: string;
  media: ViewerMediaItem[];
  mediaReview: { status: string; missingModalities: string[] } | null;
  details: string[] | string[][];
}

export type ProductLoader = (handle: string) => Promise<RuntimeProduct | null>;

export type ObservationVisibilityDecision =
  | { ready: false; reason: string; product: null }
  | { ready: true; reason: null; product: RuntimeProduct };
