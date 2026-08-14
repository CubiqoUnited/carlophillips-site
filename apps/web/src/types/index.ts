import type {
  ApprovedCampaignAsset,
  PodpipeSection,
  ProductMediaModality,
  ViewerMediaItem,
} from '@/lib/media/types';

export type CommerceEnvironment = 'local' | 'preview' | 'production';

export type ReleaseState = 'draft' | 'staged' | 'approved' | 'released';

export type CommerceSource = 'fixture' | 'shopify' | 'unavailable';

export interface MoneyAmount {
  amount: string;
  currency: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface VariantCombination {
  title: string;
  availableForSale: boolean;
  referenceHash: string;
  selectedOptions: SelectedOption[];
  price: MoneyAmount;
}

export interface VariantPresentation {
  combinations: VariantCombination[];
}

export interface MediaReview {
  status: 'complete' | 'incomplete';
  missingModalities: ProductMediaModality[];
}

export interface ProductViewModel {
  source: CommerceSource;
  sourceLabel: string;
  commerceAllowed: boolean;
  reason: string;
  id: string;
  title: string;
  handle: string;
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
  mediaReview: MediaReview | null;
  details: string[] | string[][];
  variantFingerprint?: string;
  commerceFactsFingerprint?: string;
  observationFingerprint?: string;
}

export interface ReleaseDecision {
  schemaVersion: 'cp.release-decision.v1';
  environment: CommerceEnvironment;
  status: 'available' | 'unavailable' | 'denied';
  source: CommerceSource;
  visibilityAllowed: boolean;
  commerceAllowed: boolean;
  reason: string;
  product: unknown | null;
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

export interface HomeCatalogProduct {
  title: string;
  href: string;
  sourceLabel: string;
  commerceAllowed: boolean;
  description: string;
  heroMedia: ViewerMediaItem | null;
  media: ViewerMediaItem[];
}

export interface HomeCatalogSummary {
  schemaVersion?: 'cp.home-catalog-summary.v1';
  environment?: CommerceEnvironment;
  status: 'available' | 'unavailable' | 'denied';
  candidateCount: number;
  visibleCount: number;
  excludedCount: number;
  commerceAllowed: boolean;
  message: string;
  primaryProduct: HomeCatalogProduct | null;
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

export interface BagDecision {
  schemaVersion: 'cp.bag-decision.v1';
  status: 'local_preview' | 'unavailable' | 'empty' | 'ready';
  source: CommerceSource;
  environment: CommerceEnvironment;
  commerceAllowed: boolean;
  checkoutAllowed: boolean;
  reason: string;
  cart: unknown | null;
}

export interface ProductReleaseEvidence {
  releaseRecord: {
    releaseId: string;
    state: ReleaseState;
    shopify: {
      handle: string;
      variantFingerprint?: string | null;
      variantFingerprintStatus?: string;
      commerceFactsFingerprint?: string | null;
      commerceFactsFingerprintStatus?: string;
      observationFingerprint?: string | null;
      observationFingerprintStatus?: string;
    };
  };
  mediaManifest: {
    releaseId: string;
    requirements?: Array<{
      modality: string;
      status: string;
    }>;
  };
}

export interface FixtureProduct {
  id: string;
  handle: string;
  title: string;
  price: number;
  currency: string;
  color: string;
  category: string;
  sizes: string[];
  description: string;
  details: string[][];
  media: unknown[];
}

export interface ProductPageResult {
  decision: ReleaseDecision;
  cartActivation: CartActivationSummary;
}

export interface ProductDetailProps {
  product: ProductViewModel;
  releaseReason?: string;
  cartActivation?: CartActivationSummary | null;
  environment?: CommerceEnvironment;
  podpipeSequence?: PodpipeSection[];
}

export interface HomeStorefrontProps {
  campaignAsset: ApprovedCampaignAsset | null;
  catalogSummary: HomeCatalogSummary;
}
