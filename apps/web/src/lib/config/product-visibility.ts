export const SHOW_PRODUCTS =
  process.env.NEXT_PUBLIC_SHOW_PRODUCTS === 'true' ||
  process.env.VERCEL_ENV === 'preview' ||
  process.env.NEXT_PUBLIC_STAGING_REVIEW === 'true';

export const PREVIEW_DRAFT_PRODUCTS =
  process.env.NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS === 'true' ||
  process.env.VERCEL_ENV === 'preview' ||
  process.env.NEXT_PUBLIC_STAGING_REVIEW === 'true';

import type { CommerceEnvironment } from '../commerce/runtime-types';

function isPreviewEnvironment(): boolean {
  if (process.env.VERCEL_ENV === 'preview') return true;
  return false;
}

/*
 * VERCEL_ENV is the platform's own statement about which environment this code
 * is running in, and it is the only input here that cannot be set wrong by a
 * stale project variable. It is therefore authoritative and is consulted FIRST.
 *
 * DEF-2 / D-024 root cause: this function previously let
 * NEXT_PUBLIC_COMMERCE_ENVIRONMENT and NEXT_PUBLIC_STAGING_REVIEW outrank
 * VERCEL_ENV, so a single stale variable on the Production project made the
 * whole codebase believe Production was a preview — and every consumer of this
 * gate then behaved accordingly. The gate could not distinguish environments,
 * which is the defect; the visible staging wording was only its loudest symptom.
 */
export function getCommerceEnvironment(): CommerceEnvironment {
  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }

  if (isPreviewEnvironment()) {
    return 'preview';
  }

  if (process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT) {
    const environment = process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT;
    if (['local', 'preview', 'production'].includes(environment)) {
      return environment as CommerceEnvironment;
    }
  }

  if (process.env.NEXT_PUBLIC_STAGING_REVIEW === 'true') {
    return 'preview';
  }

  return process.env.NODE_ENV === 'production' ? 'production' : 'local';
}

export function canUseFixtureData(
  environment: CommerceEnvironment = getCommerceEnvironment()
): boolean {
  return environment === 'local';
}

export function canRenderProducts(): boolean {
  return SHOW_PRODUCTS;
}

export function canRenderDraftProductPreviews(): boolean {
  if (!SHOW_PRODUCTS) return false;
  return PREVIEW_DRAFT_PRODUCTS;
}
