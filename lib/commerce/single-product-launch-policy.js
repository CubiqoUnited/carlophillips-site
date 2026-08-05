import launch from '../../config/production-commerce-launch.json';
import { validateProductObservationIntegrity } from './product-observation.js';

const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;

export function getSingleProductLaunchApproval() {
  return structuredClone(launch);
}

export function evaluateSingleProductLaunch({ environment, shopifyProduct, approval = launch }) {
  const observation = shopifyProduct?.observation;
  const integrity = validateProductObservationIntegrity(observation);
  const ready = approval.status === 'approved'
    && approval.environment === 'production'
    && ['preview', 'production'].includes(environment)
    && approval.scope === 'single-product-shopify-checkout'
    && approval.mediaPolicy === 'truthful-current-shopify-media-only'
    && approval.approvalOwner === 'Product Owner'
    && typeof approval.approvalEvidence === 'string'
    && approval.approvalEvidence.trim().length > 0
    && FINGERPRINT_PATTERN.test(approval.variantFingerprint)
    && FINGERPRINT_PATTERN.test(approval.commerceFactsFingerprint)
    && integrity.valid
    && observation?.source === 'shopify'
    && observation?.authority === 'candidate'
    && observation?.environment === environment
    && observation?.product?.handle === approval.handle
    && shopifyProduct?.handle === approval.handle
    && observation.variantFingerprint === approval.variantFingerprint
    && observation.commerceFactsFingerprint === approval.commerceFactsFingerprint;

  return {
    ready,
    reason: ready ? 'SINGLE_PRODUCT_COMMERCE_LAUNCH_APPROVED' : 'SINGLE_PRODUCT_COMMERCE_LAUNCH_DENIED',
    approval: ready ? structuredClone(approval) : null,
  };
}
