import 'server-only';

import { getServerCartActivationDecision } from './cart-activation-server';
import { getProductDecision } from './product-gateway';
import { getServerVariantResolutionReadiness } from './variant-resolution-server';
import type {
  CartActivationSummary,
  CommerceEnvironment,
  CommerceMode,
  MediaManifest,
  ProductLoader,
  ReleaseDecision,
  ReleaseRecord,
  RuntimeProduct,
} from './runtime-types';

interface ProductPageOptions {
  environment: CommerceEnvironment;
  mode: CommerceMode;
  handle: string;
  fixtureProduct?: RuntimeProduct | null;
  releaseRecord?: ReleaseRecord | null;
  mediaManifest?: MediaManifest | null;
  loadShopifyProduct: ProductLoader;
  activationApproval?: {
    status: string;
    owner: string;
    scope: string;
    evidence: string;
  } | null;
}

export async function getProductPageDecision(
  options: ProductPageOptions
): Promise<{
  decision: ReleaseDecision;
  cartActivation: CartActivationSummary;
}> {
  let rawProduct: RuntimeProduct | null = null;
  const decision = await getProductDecision({
    ...options,
    loadShopifyProduct: async (handle: string) => {
      rawProduct = await options.loadShopifyProduct(handle);
      return rawProduct;
    },
  });
  const releaseRecord = options.releaseRecord || null;
  const resolver =
    rawProduct && releaseRecord
      ? getServerVariantResolutionReadiness({
          environment: options.environment,
          rawShopifyProduct: rawProduct,
          productDecision: decision,
          releaseRecord,
        })
      : null;
  const cart = getServerCartActivationDecision({
    environment: options.environment,
    productDecision: decision,
    releaseRecord,
    variantResolverDecision: resolver,
    activationApproval: options.activationApproval || null,
  });
  return { decision, cartActivation: cart.summary };
}
