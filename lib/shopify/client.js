/**
 * Shopify Storefront API Client
 * Handles all communication with Shopify's GraphQL API
 */

import shopifyConfig from '../config/shopify';
import * as queries from './queries';
import * as mutations from './mutations';

/**
 * Make a request to Shopify Storefront API
 * @param {string} query - GraphQL query or mutation
 * @param {Object} variables - Query variables
 * @returns {Promise<Object>} - Response data
 */
async function shopifyFetch(query, variables = {}) {
  if (!shopifyConfig.isConfigured) {
    throw new Error('Shopify is not configured. Please add SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN to .env');
  }

  const response = await fetch(shopifyConfig.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error('Shopify API Error:', json.errors);
    throw new Error(json.errors[0]?.message || 'Shopify API error');
  }

  return json.data;
}

/**
 * Normalize Shopify product to app format
 * @param {Object} shopifyProduct - Raw Shopify product
 * @returns {Object} - Normalized product
 */
export function normalizeProduct(shopifyProduct) {
  if (!shopifyProduct) return null;

  const images = shopifyProduct.images?.edges?.map(edge => edge.node.url) || [];
  const variants = shopifyProduct.variants?.edges?.map(edge => edge.node) || [];
  
  // Extract unique colors and sizes from variants
  const colors = [...new Set(variants
    .flatMap(v => v.selectedOptions)
    .filter(opt => opt.name.toLowerCase() === 'color')
    .map(opt => opt.value)
  )];
  
  const sizes = [...new Set(variants
    .flatMap(v => v.selectedOptions)
    .filter(opt => opt.name.toLowerCase() === 'size')
    .map(opt => opt.value)
  )];

  // Create variant lookup map
  const shopifyVariants = {};
  variants.forEach(v => {
    const color = v.selectedOptions.find(o => o.name.toLowerCase() === 'color')?.value || '';
    const size = v.selectedOptions.find(o => o.name.toLowerCase() === 'size')?.value || '';
    shopifyVariants[`${color}-${size}`] = v.id;
  });

  return {
    id: shopifyProduct.handle,
    shopifyId: shopifyProduct.id,
    name: shopifyProduct.title,
    collection: shopifyProduct.productType?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
    price: parseFloat(shopifyProduct.priceRange?.minVariantPrice?.amount || 0),
    tagline: shopifyProduct.tags?.[0]?.toUpperCase() || '',
    description: shopifyProduct.description,
    descriptionHtml: shopifyProduct.descriptionHtml,
    details: shopifyProduct.description?.split('\n').filter(Boolean) || [],
    images,
    heroImage: images[0] || '',
    variants: {
      colors: colors.length > 0 ? colors : ['Default'],
      sizes: sizes.length > 0 ? sizes : ['One Size'],
    },
    shopifyVariants,
    availableForSale: variants.some(v => v.availableForSale),
  };
}

/**
 * Normalize Shopify collection to app format
 * @param {Object} shopifyCollection - Raw Shopify collection
 * @returns {Object} - Normalized collection
 */
export function normalizeCollection(shopifyCollection) {
  if (!shopifyCollection) return null;

  return {
    id: shopifyCollection.handle,
    shopifyId: shopifyCollection.id,
    name: shopifyCollection.title,
    description: shopifyCollection.description,
    image: shopifyCollection.image?.url || '',
    featured: true,
  };
}

/**
 * Normalize Shopify cart to app format
 * @param {Object} shopifyCart - Raw Shopify cart
 * @returns {Object} - Normalized cart
 */
export function normalizeCart(shopifyCart) {
  if (!shopifyCart) return { items: [], total: 0, checkoutUrl: '' };

  const items = shopifyCart.lines?.edges?.map(edge => {
    const line = edge.node;
    const merchandise = line.merchandise;
    const color = merchandise.selectedOptions?.find(o => o.name.toLowerCase() === 'color')?.value || '';
    const size = merchandise.selectedOptions?.find(o => o.name.toLowerCase() === 'size')?.value || '';

    return {
      key: `${merchandise.product.handle}-${color}-${size}`,
      lineItemId: line.id,
      productId: merchandise.product.handle,
      variantId: merchandise.id,
      name: merchandise.product.title,
      price: parseFloat(merchandise.price.amount),
      image: merchandise.image?.url || '',
      color,
      size,
      quantity: line.quantity,
    };
  }) || [];

  return {
    id: shopifyCart.id,
    items,
    total: parseFloat(shopifyCart.cost?.totalAmount?.amount || 0),
    checkoutUrl: shopifyCart.checkoutUrl,
    totalQuantity: shopifyCart.totalQuantity || 0,
  };
}

// ============ API Methods ============

/**
 * Get all products
 * @param {number} first - Number of products to fetch
 * @returns {Promise<Object[]>} - Normalized products
 */
export async function getProducts(first = 50) {
  const data = await shopifyFetch(queries.GET_PRODUCTS, { first });
  return data.products.edges.map(edge => normalizeProduct(edge.node));
}

/**
 * Get product by handle
 * @param {string} handle - Product handle
 * @returns {Promise<Object>} - Normalized product
 */
export async function getProductByHandle(handle) {
  const data = await shopifyFetch(queries.GET_PRODUCT_BY_HANDLE, { handle });
  return normalizeProduct(data.product);
}

/**
 * Get all collections
 * @param {number} first - Number of collections to fetch
 * @returns {Promise<Object[]>} - Normalized collections
 */
export async function getCollections(first = 20) {
  const data = await shopifyFetch(queries.GET_COLLECTIONS, { first });
  return data.collections.edges.map(edge => normalizeCollection(edge.node));
}

/**
 * Get collection by handle with products
 * @param {string} handle - Collection handle
 * @returns {Promise<Object>} - Collection with products
 */
export async function getCollectionByHandle(handle) {
  const data = await shopifyFetch(queries.GET_COLLECTION_BY_HANDLE, { handle });
  const collection = normalizeCollection(data.collection);
  const products = data.collection?.products?.edges?.map(edge => normalizeProduct(edge.node)) || [];
  return { collection, products };
}

/**
 * Get products by collection
 * @param {string} handle - Collection handle
 * @returns {Promise<Object[]>} - Products in collection
 */
export async function getProductsByCollection(handle) {
  const { products } = await getCollectionByHandle(handle);
  return products;
}

/**
 * Create a new cart
 * @returns {Promise<Object>} - Normalized cart
 */
export async function createCart() {
  const data = await shopifyFetch(mutations.CREATE_CART, { input: {} });
  return normalizeCart(data.cartCreate.cart);
}

/**
 * Get existing cart
 * @param {string} cartId - Cart ID
 * @returns {Promise<Object>} - Normalized cart
 */
export async function getCart(cartId) {
  const data = await shopifyFetch(mutations.GET_CART, { cartId });
  return normalizeCart(data.cart);
}

/**
 * Add item to cart
 * @param {string} cartId - Cart ID
 * @param {string} variantId - Shopify variant ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} - Updated cart
 */
export async function addToCart(cartId, variantId, quantity = 1) {
  const data = await shopifyFetch(mutations.ADD_TO_CART, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });
  return normalizeCart(data.cartLinesAdd.cart);
}

/**
 * Update cart line item quantity
 * @param {string} cartId - Cart ID
 * @param {string} lineItemId - Line item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} - Updated cart
 */
export async function updateCartLine(cartId, lineItemId, quantity) {
  const data = await shopifyFetch(mutations.UPDATE_CART_LINES, {
    cartId,
    lines: [{ id: lineItemId, quantity }],
  });
  return normalizeCart(data.cartLinesUpdate.cart);
}

/**
 * Remove item from cart
 * @param {string} cartId - Cart ID
 * @param {string} lineItemId - Line item ID
 * @returns {Promise<Object>} - Updated cart
 */
export async function removeFromCart(cartId, lineItemId) {
  const data = await shopifyFetch(mutations.REMOVE_FROM_CART, {
    cartId,
    lineIds: [lineItemId],
  });
  return normalizeCart(data.cartLinesRemove.cart);
}

/**
 * Search products
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} - Matching products
 */
export async function searchProducts(query) {
  const data = await shopifyFetch(queries.SEARCH_PRODUCTS, { query });
  return data.search.edges
    .filter(edge => edge.node.__typename === 'Product')
    .map(edge => normalizeProduct(edge.node));
}

export default {
  getProducts,
  getProductByHandle,
  getCollections,
  getCollectionByHandle,
  getProductsByCollection,
  createCart,
  getCart,
  addToCart,
  updateCartLine,
  removeFromCart,
  searchProducts,
  normalizeProduct,
  normalizeCollection,
  normalizeCart,
};
