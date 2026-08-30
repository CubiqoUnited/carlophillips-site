import 'server-only';

import { evaluateVariantResolutionReadiness } from './variant-resolution-policy';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../orchestration/capability-registry';
import type {
  CommerceEnvironment,
  ReleaseDecision,
  ReleaseRecord,
  RuntimeProduct,
  VariantResolutionDecision,
} from './runtime-types';

/**
 * The sole production entry for variant-resolution readiness. The server-only
 * Storefront loader necessarily receives raw Shopify references first so it
 * can create the canonical hashed observation.
 *
 * `local` in the capability registry describes where the deterministic
 * implementation was verified. The returned `server_only` decision describes
 * the runtime containment boundary. The pure evaluator consumes raw IDs
 * ephemerally and returns no raw reference or mutation target. This entry is
 * intentionally not wired into cart activation yet.
 */
export function getServerVariantResolutionReadiness({
  environment,
  rawShopifyProduct,
  productDecision,
  releaseRecord,
}: {
  environment: CommerceEnvironment;
  rawShopifyProduct: RuntimeProduct;
  productDecision: ReleaseDecision;
  releaseRecord: ReleaseRecord;
}): VariantResolutionDecision {
  const registry = getCapabilityRegistry();
  const productReadCapabilityDecision = discoverCapability(
    registry,
    'shopify-storefront-product-read',
    'product-read'
  );
  const resolverCapabilityDecision = discoverCapability(
    registry,
    'shopify-storefront-variant-resolver',
    'resolve-reviewed-variant'
  );

  return evaluateVariantResolutionReadiness({
    environment,
    rawShopifyProduct,
    productDecision,
    releaseRecord,
    productReadCapabilityDecision,
    resolverCapabilityDecision,
  });
}
