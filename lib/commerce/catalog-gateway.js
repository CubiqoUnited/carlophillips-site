import { getProductDecision } from './product-gateway.js';
import { toProductViewModel } from './product-view-model.js';

function unique(values) {
  return [...new Set(values)];
}

function unavailableCandidateDecision(environment, reason) {
  return {
    schemaVersion: 'cp.release-decision.v1',
    environment,
    status: 'unavailable',
    source: 'unavailable',
    visibilityAllowed: false,
    commerceAllowed: false,
    reason,
    product: null,
  };
}

function isValidHandle(handle) {
  return typeof handle === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle);
}

async function resolveCatalogCandidate({
  environment,
  mode,
  handle,
  fixtureProducts,
  getReleaseEvidence,
  loadShopifyProduct,
}) {
  if (!isValidHandle(handle)) {
    return unavailableCandidateDecision(environment, 'CATALOG_CANDIDATE_HANDLE_INVALID');
  }

  try {
    return await getProductDecision({
      environment,
      mode,
      handle,
      fixtureProduct: fixtureProducts.find(product => product.handle === handle) || null,
      ...(getReleaseEvidence(handle) || {}),
      loadShopifyProduct,
    });
  } catch {
    return unavailableCandidateDecision(environment, 'CATALOG_CANDIDATE_RESOLUTION_FAILED');
  }
}

export function validateCatalogDecisionInvariants(decision) {
  const errors = [];
  if (decision.candidateCount !== decision.visibleCount + decision.excludedCount) {
    errors.push('candidate count must equal visible plus excluded counts');
  }
  if (decision.products.length !== decision.visibleCount) {
    errors.push('product payload count must equal visible count');
  }
  if (decision.products.some(product => product.commerceAllowed) !== decision.commerceAllowed) {
    errors.push('catalog commerce flag must match visible product commerce');
  }
  return errors;
}

function finalizeCatalogDecision(decision) {
  const errors = validateCatalogDecisionInvariants(decision);
  if (errors.length) throw new Error(`Catalog decision invariant failed: ${errors.join('; ')}`);
  return decision;
}

export function closedCatalogDecision(environment, candidateCount = 0) {
  return finalizeCatalogDecision({
    schemaVersion: 'cp.catalog-decision.v1',
    environment,
    status: 'denied',
    source: 'unavailable',
    candidateCount,
    visibleCount: 0,
    excludedCount: candidateCount,
    commerceAllowed: false,
    reason: 'PRODUCT_VISIBILITY_GATE_CLOSED',
    excludedReasons: ['PRODUCT_VISIBILITY_GATE_CLOSED'],
    products: [],
  });
}

export async function getCatalogDecision({
  environment,
  mode,
  candidateHandles,
  fixtureProducts = [],
  getReleaseEvidence,
  loadShopifyProduct,
}) {
  const handles = unique(candidateHandles);
  const decisions = await Promise.all(handles.map(handle => resolveCatalogCandidate({
    environment,
    mode,
    handle,
    fixtureProducts,
    getReleaseEvidence,
    loadShopifyProduct,
  })));

  const normalized = decisions.map(decision => {
    if (!decision.visibilityAllowed || !decision.product) {
      return { product: null, excludedReason: decision.reason };
    }
    try {
      const product = toProductViewModel(decision);
      return product
        ? { product, excludedReason: null }
        : { product: null, excludedReason: 'CATALOG_PRODUCT_NORMALIZATION_FAILED' };
    } catch {
      return { product: null, excludedReason: 'CATALOG_PRODUCT_NORMALIZATION_FAILED' };
    }
  });
  const products = normalized.map(result => result.product).filter(Boolean);
  const excludedReasons = unique(
    normalized.map(result => result.excludedReason).filter(Boolean)
  );
  const visibleCount = products.length;
  const commerceAllowed = ['preview', 'production'].includes(environment)
    && products.some(product => product.commerceAllowed === true);

  return finalizeCatalogDecision({
    schemaVersion: 'cp.catalog-decision.v1',
    environment,
    status: visibleCount > 0 ? 'available' : 'unavailable',
    source: visibleCount > 0 ? mode : 'unavailable',
    candidateCount: handles.length,
    visibleCount,
    excludedCount: handles.length - visibleCount,
    commerceAllowed,
    reason: visibleCount > 0 ? 'CATALOG_ITEMS_AVAILABLE' : 'NO_RELEASE_ELIGIBLE_PRODUCTS',
    excludedReasons,
    products,
  });
}
