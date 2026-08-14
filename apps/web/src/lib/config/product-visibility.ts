export const SHOW_PRODUCTS = process.env.NEXT_PUBLIC_SHOW_PRODUCTS === 'true';
export const PREVIEW_DRAFT_PRODUCTS =
  process.env.NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS === 'true';

export function getCommerceEnvironment(): CommerceEnvironment {
  if (process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT) {
    const environment = process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT;
    if (['local', 'preview', 'production'].includes(environment)) {
      return environment as CommerceEnvironment;
    }
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
  return canUseFixtureData() && SHOW_PRODUCTS && PREVIEW_DRAFT_PRODUCTS;
}
import type { CommerceEnvironment } from '../commerce/runtime-types';
