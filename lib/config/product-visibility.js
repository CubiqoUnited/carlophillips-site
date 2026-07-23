export const SHOW_PRODUCTS = process.env.NEXT_PUBLIC_SHOW_PRODUCTS === 'true';
export const PREVIEW_DRAFT_PRODUCTS = process.env.NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS === 'true';

export function getCommerceEnvironment() {
  if (process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT) {
    return process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT;
  }

  return process.env.NODE_ENV === 'production' ? 'production' : 'local';
}

export function canUseFixtureData(environment = getCommerceEnvironment()) {
  return environment === 'local';
}

export function canRenderProducts() {
  return SHOW_PRODUCTS;
}

export function canRenderDraftProductPreviews() {
  return canUseFixtureData() && SHOW_PRODUCTS && PREVIEW_DRAFT_PRODUCTS;
}
