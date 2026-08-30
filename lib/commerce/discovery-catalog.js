/*
 * Discovery catalog overlays (workbook screens 07 and 08).
 *
 * The mocks show six category cards and a six-item product grid. The counts in a mock are
 * placeholders, not a claim about inventory, so they are derived here from whatever the release
 * decision actually made visible. A group with nothing released says so rather than borrowing the
 * mock's number: the workbook's own governance forbids presenting unreleased product as available.
 */

export const DISCOVERY_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'hoodies', label: 'Hoodies', href: '/shop?category=hoodies', productTypes: Object.freeze(['hoodie', 'hoodies', 'sweatshirt']), editorialImageUrl: '/products/signature-hoodie/candidates/moda/model-front-full.jpg', editorialImageAlt: 'Black hoodie — CARLOPHILLIPS Signature Hoodie, front view' }),
  Object.freeze({ id: 'jackets', label: 'Jackets', href: '/shop?category=jackets', productTypes: Object.freeze(['jacket', 'jackets']), editorialImageUrl: '/products/signature-hoodie/candidates/moda/model-side-profile.jpg', editorialImageAlt: 'CARLOPHILLIPS editorial — side silhouette study' }),
  Object.freeze({ id: 'knitwear', label: 'Knitwear', href: '/shop?category=knitwear', productTypes: Object.freeze(['knitwear', 'knit']), editorialImageUrl: '/products/signature-hoodie/candidates/moda/model-three-quarter.jpg', editorialImageAlt: 'CARLOPHILLIPS editorial — three-quarter studio study' }),
  Object.freeze({ id: 'trousers', label: 'Trousers', href: '/shop?category=trousers', productTypes: Object.freeze(['trousers', 'trouser', 'pants']), editorialImageUrl: '/products/signature-hoodie/candidates/moda/model-seated.jpg', editorialImageAlt: 'CARLOPHILLIPS editorial — seated garment study' }),
  Object.freeze({ id: 'accessories', label: 'Accessories', href: '/shop?category=accessories', productTypes: Object.freeze(['accessory', 'accessories']), editorialImageUrl: '/products/signature-hoodie/candidates/ai-assisted/material-embroidery-study.png', editorialImageAlt: 'CARLOPHILLIPS CP embroidery detail study' }),
  Object.freeze({ id: 'footwear', label: 'Footwear', href: '/shop?category=footwear', productTypes: Object.freeze(['footwear', 'shoes']), editorialImageUrl: '/products/signature-hoodie/candidates/moda/product-flat-lay.jpg', editorialImageAlt: 'CARLOPHILLIPS editorial — product flat-lay study' }),
]);

function categoryIdFor(product) {
  const haystack = `${product?.productType || ''} ${product?.title || ''}`.toLowerCase();
  return DISCOVERY_CATEGORIES.find(category => category.productTypes.some(type => haystack.includes(type)))?.id || null;
}

export function releasedProductCards(summary) {
  const product = summary?.primaryProduct;
  if (!summary || summary.visibleCount <= 0 || !product) return [];
  return [{
    id: product.handle || product.href || 'primary',
    name: product.displayName || product.title,
    href: product.href,
    price: Number(product.price) > 0 ? product.price : null,
    currency: product.currency || 'EUR',
    imageUrl: product.heroMedia?.url || product.media?.[0]?.url || null,
    imageAlt: product.heroMedia?.alt || product.media?.[0]?.alt || '',
    categoryId: categoryIdFor(product) || 'hoodies',
  }];
}

export function discoveryCategoryCards(summary, activeCategoryId = 'hoodies') {
  const products = releasedProductCards(summary);
  return DISCOVERY_CATEGORIES.map(category => {
    const count = products.filter(product => product.categoryId === category.id).length;
    return {
      id: category.id,
      name: category.label,
      href: category.href,
      meta: count > 0
        ? `${count} ${count === 1 ? 'item' : 'items'}`
        : 'Not yet released',
      available: count > 0,
      viewing: category.id === activeCategoryId && count > 0,
      imageUrl: products.find(product => product.categoryId === category.id)?.imageUrl || category.editorialImageUrl || null,
      imageAlt: products.find(product => product.categoryId === category.id)?.imageAlt || category.editorialImageAlt || '',
    };
  });
}

export function discoveryProductCards(summary, categoryId = 'hoodies', viewingId = null) {
  return releasedProductCards(summary)
    .filter(product => product.categoryId === categoryId)
    .map(product => ({
      id: product.id,
      name: product.name,
      href: product.href,
      meta: product.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency, maximumFractionDigits: 0 }).format(product.price) : 'Price on release',
      available: true,
      viewing: product.id === viewingId,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
    }));
}
