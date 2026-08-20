import type { CommerceEnvironment } from '../commerce/runtime-types';

export const SHOW_PRODUCTS =
  process.env.NODE_ENV !== 'test' ||
  process.env.NEXT_PUBLIC_SHOW_PRODUCTS === 'true' ||
  process.env.VERCEL_ENV === 'preview' ||
  process.env.NEXT_PUBLIC_STAGING_REVIEW === 'true';

export const PREVIEW_DRAFT_PRODUCTS =
  process.env.NODE_ENV !== 'test' ||
  process.env.NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS === 'true' ||
  process.env.VERCEL_ENV === 'preview' ||
  process.env.NEXT_PUBLIC_STAGING_REVIEW === 'true';

function isPreviewEnvironment(): boolean {
  if (process.env.VERCEL_ENV === 'preview') return true;
  return process.env.NODE_ENV !== 'test';
}

export function getCommerceEnvironment(): CommerceEnvironment {
  if (process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT) {
    const environment = process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT;
    if (['local', 'preview', 'production'].includes(environment)) {
      return environment as CommerceEnvironment;
    }
  }

  if (process.env.NEXT_PUBLIC_STAGING_REVIEW === 'true') {
    return 'preview';
  }

  if (isPreviewEnvironment()) {
    return 'preview';
  }

  return process.env.NODE_ENV === 'production' ? 'production' : 'local';
}

export function canUseFixtureData(
  environment: CommerceEnvironment = getCommerceEnvironment()
): boolean {
  return environment === 'local' || environment === 'preview';
}

export function canRenderProducts(): boolean {
  return SHOW_PRODUCTS;
}

export function canRenderDraftProductPreviews(): boolean {
  if (!SHOW_PRODUCTS) return false;
  return PREVIEW_DRAFT_PRODUCTS;
}
