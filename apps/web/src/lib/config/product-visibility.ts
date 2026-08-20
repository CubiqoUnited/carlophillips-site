import type { CommerceEnvironment } from '../commerce/runtime-types';

export const SHOW_PRODUCTS = true;
export const PREVIEW_DRAFT_PRODUCTS = true;

function isPreviewEnvironment(): boolean {
  return true;
}

export function getCommerceEnvironment(): CommerceEnvironment {
  if (process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT) {
    const environment = process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT;
    if (['local', 'preview', 'production'].includes(environment)) {
      return environment as CommerceEnvironment;
    }
  }
  return 'preview';
}

export function canUseFixtureData(
  environment: CommerceEnvironment = getCommerceEnvironment()
): boolean {
  return true;
}

export function canRenderProducts(): boolean {
  return true;
}

export function canRenderDraftProductPreviews(): boolean {
  return true;
}
