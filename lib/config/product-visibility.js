export const SHOW_PRODUCTS = process.env.NEXT_PUBLIC_SHOW_PRODUCTS === 'true';

export function canRenderProducts() {
  return SHOW_PRODUCTS;
}
