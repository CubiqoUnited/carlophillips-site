/**
 * Shopify Storefront API Client
 * 
 * Production-safe implementation with:
 * - Automatic retry on failure
 * - Graceful error handling
 * - Request timeout
 * - Rate limiting awareness
 * - Detailed logging
 */

import shopifyConfig from '../config/shopify';
import * as queries from './queries';
import * as mutations from './mutations';

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if Shopify is properly configured
 * @returns {boolean}
 */
export function isShopifyConfigured() {
  return shopifyConfig.isConfigured;
}

/**
 * Make a request to Shopify Storefront API with retry logic
 * @param {string} query - GraphQL query or mutation
 * @param {Object} variables - Query variables
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} - Response data
 */
async function shopifyFetch(query, variables = {}, retryCount = 0) {
  // Check configuration
  if (!shopifyConfig.isConfigured) {
    const error = new Error('SHOPIFY_NOT_CONFIGURED');
    error.code = 'SHOPIFY_NOT_CONFIGURED';
    throw error;
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(shopifyConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 2;
      console.warn(`Shopify rate limited. Retrying after ${retryAfter}s...`);
      await sleep(parseInt(retryAfter) * 1000);
      return shopifyFetch(query, variables, retryCount);
    }

    // Handle server errors with retry
    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      console.warn(`Shopify server error (${response.status}). Retry ${retryCount + 1}/${MAX_RETRIES}...`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return shopifyFetch(query, variables, retryCount + 1);
    }

    if (!response.ok) {
      throw new Error(`Shopify API returned ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    // Handle GraphQL errors
    if (json.errors) {
      const errorMessages = json.errors.map(e => e.message).join(', ');
      console.error('Shopify GraphQL Error:', errorMessages);
      
      // Check for throttling errors
      if (json.errors.some(e => e.message?.includes('Throttled'))) {
        if (retryCount < MAX_RETRIES) {
          console.warn(`Shopify throttled. Retry ${retryCount + 1}/${MAX_RETRIES}...`);
          await sleep(RETRY_DELAY * (retryCount + 1));
          return shopifyFetch(query, variables, retryCount + 1);
        }
      }
      
      throw new Error(errorMessages);
    }

    return json.data;
  } catch (error) {
    // Handle abort/timeout
    if (error.name === 'AbortError') {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Shopify request timeout. Retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await sleep(RETRY_DELAY);
        return shopifyFetch(query, variables, retryCount + 1);
      }
      throw new Error('Shopify request timeout after multiple retries');
    }

    // Handle network errors with retry
    if (error.message?.includes('fetch') && retryCount < MAX_RETRIES) {
      console.warn(`Network error. Retry ${retryCount + 1}/${MAX_RETRIES}...`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return shopifyFetch(query, variables, retryCount + 1);
    }

    throw error;
  }
}

// ============ NORMALIZATION FUNCTIONS ============

/**
 * Normalize Shopify product to app format
 * @param {Object} shopifyProduct - Raw Shopify product
 * @returns {Object|null} - Normalized product
 */
export function normalizeProduct(shopifyProduct) {
  if (!shopifyProduct) return null;

  try {
    const images = shopifyProduct.images?.edges?.map(edge => edge.node.url) || [];
    const variants = shopifyProduct.variants?.edges?.map(edge => edge.node) || [];
    
    // Extract unique colors and sizes from variants
    const colors = [...new Set(variants
      .flatMap(v => v.selectedOptions || [])
      .filter(opt => opt.name?.toLowerCase() === 'color')
      .map(opt => opt.value)
    )];
    
    const sizes = [...new Set(variants
      .flatMap(v => v.selectedOptions || [])
      .filter(opt => opt.name?.toLowerCase() === 'size')
      .map(opt => opt.value)
    )];

    // Create variant lookup map for cart operations
    const shopifyVariants = {};
    variants.forEach(v => {
      const color = v.selectedOptions?.find(o => o.name?.toLowerCase() === 'color')?.value || 'Default';
      const size = v.selectedOptions?.find(o => o.name?.toLowerCase() === 'size')?.value || 'One Size';
      shopifyVariants[`${color}-${size}`] = v.id;
    });

    // Get first available variant ID
    const firstVariantId = variants[0]?.id || null;

    return {
      id: shopifyProduct.handle,
      shopifyId: shopifyProduct.id,
      name: shopifyProduct.title,
      collection: shopifyProduct.productType?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
      price: parseFloat(shopifyProduct.priceRange?.minVariantPrice?.amount || 0),
      compareAtPrice: parseFloat(shopifyProduct.priceRange?.maxVariantPrice?.amount || 0),
      currency: shopifyProduct.priceRange?.minVariantPrice?.currencyCode || 'USD',
      tagline: shopifyProduct.tags?.[0]?.toUpperCase() || '',
      description: shopifyProduct.description || '',
      descriptionHtml: shopifyProduct.descriptionHtml || '',
      details: shopifyProduct.description?.split('\\n').filter(Boolean) || [],
      images,
      heroImage: images[0] || '',
      variants: {
        colors: colors.length > 0 ? colors : ['Default'],
        sizes: sizes.length > 0 ? sizes : ['One Size'],
      },
      shopifyVariants,
      firstVariantId,
      availableForSale: variants.some(v => v.availableForSale),
      vendor: shopifyProduct.vendor || '',
      productType: shopifyProduct.productType || '',
      tags: shopifyProduct.tags || [],
    };
  } catch (error) {
    console.error('Error normalizing product:', error, shopifyProduct);
    return null;
  }
}

/**
 * Normalize Shopify collection to app format
 * @param {Object} shopifyCollection - Raw Shopify collection
 * @returns {Object|null} - Normalized collection
 */
export function normalizeCollection(shopifyCollection) {
  if (!shopifyCollection) return null;

  try {
    return {
      id: shopifyCollection.handle,
      shopifyId: shopifyCollection.id,
      name: shopifyCollection.title,
      description: shopifyCollection.description || '',
      image: shopifyCollection.image?.url || '',
      featured: true,
    };
  } catch (error) {
    console.error('Error normalizing collection:', error, shopifyCollection);
    return null;
  }
}

/**
 * Normalize Shopify cart to app format
 * @param {Object} shopifyCart - Raw Shopify cart
 * @returns {Object} - Normalized cart
 */
export function normalizeCart(shopifyCart) {
  if (!shopifyCart) {
    return { id: null, items: [], total: 0, checkoutUrl: '', totalQuantity: 0 };
  }

  try {
    const items = shopifyCart.lines?.edges?.map(edge => {
      const line = edge.node;
      const merchandise = line.merchandise;
      const color = merchandise.selectedOptions?.find(o => o.name?.toLowerCase() === 'color')?.value || 'Default';
      const size = merchandise.selectedOptions?.find(o => o.name?.toLowerCase() === 'size')?.value || 'One Size';

      return {
        key: `${merchandise.product?.handle || 'product'}-${color}-${size}`,
        lineItemId: line.id,
        productId: merchandise.product?.handle || '',
        variantId: merchandise.id,
        name: merchandise.product?.title || 'Product',
        price: parseFloat(merchandise.price?.amount || 0),
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
      subtotal: parseFloat(shopifyCart.cost?.subtotalAmount?.amount || 0),
      checkoutUrl: shopifyCart.checkoutUrl || '',
      totalQuantity: shopifyCart.totalQuantity || 0,
    };
  } catch (error) {
    console.error('Error normalizing cart:', error, shopifyCart);
    return { id: null, items: [], total: 0, checkoutUrl: '', totalQuantity: 0 };
  }
}

// ============ PRODUCT API ============

/**
 * Get all products
 * @param {number} first - Number of products to fetch
 * @returns {Promise<Object[]>} - Normalized products
 */
export async function getProducts(first = 100) {
  const data = await shopifyFetch(queries.GET_PRODUCTS, { first });
  return data.products.edges
    .map(edge => normalizeProduct(edge.node))
    .filter(Boolean);
}

/**
 * Get product by handle
 * @param {string} handle - Product handle
 * @returns {Promise<Object|null>} - Normalized product
 */
export async function getProductByHandle(handle) {
  const data = await shopifyFetch(queries.GET_PRODUCT_BY_HANDLE, { handle });
  return normalizeProduct(data.product);
}

/**
 * Get featured products
 * @param {number} first - Number of products to fetch
 * @returns {Promise<Object[]>} - Normalized products
 */
export async function getFeaturedProducts(first = 8) {
  const data = await shopifyFetch(queries.GET_FEATURED_PRODUCTS, { first });
  return data.products.edges
    .map(edge => normalizeProduct(edge.node))
    .filter(Boolean);
}

// ============ COLLECTION API ============

/**
 * Get all collections
 * @param {number} first - Number of collections to fetch
 * @returns {Promise<Object[]>} - Normalized collections
 */
export async function getCollections(first = 20) {
  const data = await shopifyFetch(queries.GET_COLLECTIONS, { first });
  return data.collections.edges
    .map(edge => normalizeCollection(edge.node))
    .filter(Boolean);
}

/**
 * Get collection by handle with products
 * @param {string} handle - Collection handle
 * @param {number} productsFirst - Number of products to fetch
 * @returns {Promise<Object>} - Collection with products
 */
export async function getCollectionByHandle(handle, productsFirst = 50) {
  const data = await shopifyFetch(queries.GET_COLLECTION_BY_HANDLE, { 
    handle, 
    productsFirst 
  });
  
  const collection = normalizeCollection(data.collection);
  const products = data.collection?.products?.edges
    ?.map(edge => normalizeProduct(edge.node))
    .filter(Boolean) || [];
  
  return { collection, products };
}

/**
 * Get products by collection handle
 * @param {string} handle - Collection handle
 * @returns {Promise<Object[]>} - Products in collection
 */
export async function getProductsByCollection(handle) {
  const { products } = await getCollectionByHandle(handle);
  return products;
}

// ============ CART API ============

/**
 * Create a new cart
 * @param {Object[]} lines - Initial cart lines (optional)
 * @returns {Promise<Object>} - Normalized cart
 */
export async function createCart(lines = []) {
  const input = lines.length > 0 ? { lines } : {};
  const data = await shopifyFetch(mutations.CREATE_CART, { input });
  
  if (data.cartCreate.userErrors?.length > 0) {
    const errors = data.cartCreate.userErrors.map(e => e.message).join(', ');
    throw new Error(`Cart creation failed: ${errors}`);
  }
  
  return normalizeCart(data.cartCreate.cart);
}

/**
 * Get existing cart by ID
 * @param {string} cartId - Cart ID
 * @returns {Promise<Object|null>} - Normalized cart or null if not found
 */
export async function getCart(cartId) {
  try {
    const data = await shopifyFetch(mutations.GET_CART, { cartId });
    return normalizeCart(data.cart);
  } catch (error) {
    // Cart may have expired or been deleted
    console.warn('Failed to get cart:', error.message);
    return null;
  }
}

/**
 * Add items to cart
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
  
  if (data.cartLinesAdd.userErrors?.length > 0) {
    const errors = data.cartLinesAdd.userErrors.map(e => e.message).join(', ');
    throw new Error(`Add to cart failed: ${errors}`);
  }
  
  return normalizeCart(data.cartLinesAdd.cart);
}

/**
 * Add multiple items to cart
 * @param {string} cartId - Cart ID
 * @param {Object[]} lines - Array of { variantId, quantity }
 * @returns {Promise<Object>} - Updated cart
 */
export async function addMultipleToCart(cartId, lines) {
  const formattedLines = lines.map(line => ({
    merchandiseId: line.variantId,
    quantity: line.quantity || 1,
  }));
  
  const data = await shopifyFetch(mutations.ADD_TO_CART, {
    cartId,
    lines: formattedLines,
  });
  
  if (data.cartLinesAdd.userErrors?.length > 0) {
    const errors = data.cartLinesAdd.userErrors.map(e => e.message).join(', ');
    throw new Error(`Add to cart failed: ${errors}`);
  }
  
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
  
  if (data.cartLinesUpdate.userErrors?.length > 0) {
    const errors = data.cartLinesUpdate.userErrors.map(e => e.message).join(', ');
    throw new Error(`Update cart failed: ${errors}`);
  }
  
  return normalizeCart(data.cartLinesUpdate.cart);
}

/**
 * Update multiple cart lines
 * @param {string} cartId - Cart ID
 * @param {Object[]} lines - Array of { lineItemId, quantity }
 * @returns {Promise<Object>} - Updated cart
 */
export async function updateMultipleCartLines(cartId, lines) {
  const formattedLines = lines.map(line => ({
    id: line.lineItemId,
    quantity: line.quantity,
  }));
  
  const data = await shopifyFetch(mutations.UPDATE_CART_LINES, {
    cartId,
    lines: formattedLines,
  });
  
  if (data.cartLinesUpdate.userErrors?.length > 0) {
    const errors = data.cartLinesUpdate.userErrors.map(e => e.message).join(', ');
    throw new Error(`Update cart failed: ${errors}`);
  }
  
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
  
  if (data.cartLinesRemove.userErrors?.length > 0) {
    const errors = data.cartLinesRemove.userErrors.map(e => e.message).join(', ');
    throw new Error(`Remove from cart failed: ${errors}`);
  }
  
  return normalizeCart(data.cartLinesRemove.cart);
}

/**
 * Remove multiple items from cart
 * @param {string} cartId - Cart ID
 * @param {string[]} lineItemIds - Array of line item IDs
 * @returns {Promise<Object>} - Updated cart
 */
export async function removeMultipleFromCart(cartId, lineItemIds) {
  const data = await shopifyFetch(mutations.REMOVE_FROM_CART, {
    cartId,
    lineIds: lineItemIds,
  });
  
  if (data.cartLinesRemove.userErrors?.length > 0) {
    const errors = data.cartLinesRemove.userErrors.map(e => e.message).join(', ');
    throw new Error(`Remove from cart failed: ${errors}`);
  }
  
  return normalizeCart(data.cartLinesRemove.cart);
}

// ============ SEARCH API ============

/**
 * Search products
 * @param {string} query - Search query
 * @param {number} first - Number of results
 * @returns {Promise<Object[]>} - Matching products
 */
export async function searchProducts(query, first = 20) {
  const data = await shopifyFetch(queries.SEARCH_PRODUCTS, { query, first });
  return data.search.edges
    .filter(edge => edge.node.__typename === 'Product')
    .map(edge => normalizeProduct(edge.node))
    .filter(Boolean);
}

// ============ EXPORTS ============

export default {
  // Config
  isShopifyConfigured,
  
  // Products
  getProducts,
  getProductByHandle,
  getFeaturedProducts,
  
  // Collections
  getCollections,
  getCollectionByHandle,
  getProductsByCollection,
  
  // Cart
  createCart,
  getCart,
  addToCart,
  addMultipleToCart,
  updateCartLine,
  updateMultipleCartLines,
  removeFromCart,
  removeMultipleFromCart,
  
  // Search
  searchProducts,
  
  // Normalization
  normalizeProduct,
  normalizeCollection,
  normalizeCart,
};
