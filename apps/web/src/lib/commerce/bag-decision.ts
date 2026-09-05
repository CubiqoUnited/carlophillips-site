import { canUseFixtureData } from '../config/product-visibility';
import type { CommerceEnvironment } from './runtime-types';

interface BagCart {
  source: 'fixture' | 'shopify' | string;
  items: unknown[];
}

interface ActivationDecision {
  cartAllowed?: boolean;
  reason?: string;
}

export function resolveStorefrontBagStatus({
  available,
  lineCount,
}: {
  available: boolean;
  lineCount: number;
}): 'unavailable' | 'empty' | 'ready' {
  if (!available) return 'unavailable';
  return lineCount > 0 ? 'ready' : 'empty';
}

export function resolveBagDecision({
  environment,
  activationDecision,
  cart = null,
}: {
  environment: CommerceEnvironment;
  activationDecision: ActivationDecision | null;
  cart?: BagCart | null;
}) {
  if (cart?.source === 'fixture') {
    if (!canUseFixtureData(environment)) {
      return unavailableDecision(environment, 'FIXTURE_CART_FORBIDDEN');
    }
    return localPreviewDecision();
  }

  if (activationDecision?.cartAllowed !== true) {
    if (canUseFixtureData(environment))
      return localPreviewDecision(activationDecision?.reason);
    return unavailableDecision(environment, activationDecision?.reason);
  }

  if (!cart) {
    return {
      schemaVersion: 'cp.bag-decision.v1',
      status: 'empty',
      source: 'shopify',
      environment,
      commerceAllowed: true,
      checkoutAllowed: false,
      reason: 'SHOPIFY_CART_EMPTY',
      cart: null,
    };
  }

  if (cart.source !== 'shopify')
    return unavailableDecision(environment, 'CART_SOURCE_INVALID');

  return {
    schemaVersion: 'cp.bag-decision.v1',
    status: cart.items.length ? 'ready' : 'empty',
    source: 'shopify',
    environment,
    commerceAllowed: true,
    checkoutAllowed: false,
    reason: cart.items.length
      ? 'CHECKOUT_RELEASE_APPROVAL_REQUIRED'
      : 'SHOPIFY_CART_EMPTY',
    cart,
  };
}

function localPreviewDecision(capabilityReason = 'LOCAL_NON_COMMERCE_PREVIEW') {
  return {
    schemaVersion: 'cp.bag-decision.v1',
    status: 'local_preview',
    source: 'fixture',
    environment: 'local',
    commerceAllowed: false,
    checkoutAllowed: false,
    reason: capabilityReason || 'LOCAL_NON_COMMERCE_PREVIEW',
    cart: null,
  };
}

function unavailableDecision(
  environment: CommerceEnvironment,
  reason?: string
) {
  return {
    schemaVersion: 'cp.bag-decision.v1',
    status: 'unavailable',
    source: 'unavailable',
    environment,
    commerceAllowed: false,
    checkoutAllowed: false,
    reason: reason || 'SHOPIFY_CART_UNAVAILABLE',
    cart: null,
  };
}
