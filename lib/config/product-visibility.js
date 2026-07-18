export const SHOW_PRODUCTS = process.env.NEXT_PUBLIC_SHOW_PRODUCTS === 'true';
export const PREVIEW_DRAFT_PRODUCTS = process.env.NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS === 'true';

export function canRenderProducts() {
  return SHOW_PRODUCTS;
}

export function canRenderDraftProductPreviews() {
  return SHOW_PRODUCTS && PREVIEW_DRAFT_PRODUCTS;
}
