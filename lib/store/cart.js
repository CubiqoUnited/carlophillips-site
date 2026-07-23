/**
 * Legacy browser cart adapter.
 *
 * This module is dormant in the current editorial shell. Local fixture carts
 * are permitted only in the explicit local commerce environment. Preview and
 * production fail closed when Shopify is unavailable or rejects an operation.
 */

import shopifyConfig from '../config/shopify';
import shopifyClient, { isShopifyConfigured } from '../shopify/client';
import {
  addLocalCartLine,
  assertLocalCartAllowed,
  createEmptyCart as createPolicyCart,
  parseCheckoutHosts,
  removeLocalCartLine,
  restoreOrCreateCart,
  unavailableCartError,
  updateLocalCartLine,
  validateCheckoutUrl,
} from '../commerce/cart-policy';
import { getCommerceEnvironment } from '../config/product-visibility';

// Storage keys
export const CART_STORAGE_KEY = 'carlophillips_cart';
export const CART_ID_KEY = 'carlophillips_cart_id';

// In-memory cache for cart state
let cartCache = null;

/**
 * Check if Shopify cart should be used
 */
export function shouldUseShopifyCart() {
  if (typeof window === 'undefined') return false;
  return isShopifyConfigured();
}

/**
 * Get stored Shopify cart ID from localStorage
 * @returns {string|null}
 */
function getStoredCartId() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CART_ID_KEY);
  } catch (e) {
    return null;
  }
}

/**
 * Store Shopify cart ID in localStorage
 * @param {string} cartId
 */
function storeCartId(cartId) {
  if (typeof window === 'undefined') return;
  try {
    if (cartId) {
      localStorage.setItem(CART_ID_KEY, cartId);
    } else {
      localStorage.removeItem(CART_ID_KEY);
    }
  } catch (e) {
    console.error('Failed to store cart ID:', e);
  }
}

/**
 * Create an empty cart object
 * @returns {Object}
 */
function createEmptyCart() {
  return createPolicyCart('fixture');
}

function requireLocalCart() {
  assertLocalCartAllowed(getCommerceEnvironment());
}

function checkoutHosts() {
  const configured = parseCheckoutHosts(process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_HOSTS || '');
  const storeHost = shopifyConfig.storeDomain?.trim().toLowerCase();
  return [...new Set([...configured, ...(storeHost ? [storeHost] : [])])];
}

/**
 * Get cart from localStorage
 * @returns {Object} Cart object
 */
export function getCart() {
  if (typeof window === 'undefined') {
    requireLocalCart();
    return createEmptyCart();
  }

  if (!shouldUseShopifyCart()) requireLocalCart();

  // Return cached cart if available
  if (cartCache) {
    if (cartCache.source !== 'shopify') requireLocalCart();
    return cartCache;
  }

  let storedCart = null;
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) storedCart = JSON.parse(stored);
  } catch (e) {
    console.error('Error reading cart from localStorage:', e);
  }

  if (storedCart) {
    cartCache = {
      schemaVersion: 'cp.commerce-cart.v1',
      source: storedCart.source === 'shopify' ? 'shopify' : 'fixture',
      id: storedCart.id || null,
      items: storedCart.items || [],
      total: storedCart.total || 0,
      subtotal: storedCart.subtotal || storedCart.total || 0,
      checkoutUrl: storedCart.checkoutUrl || '',
      totalQuantity: storedCart.totalQuantity || 0,
    };
    if (cartCache.source !== 'shopify') requireLocalCart();
    return cartCache;
  }

  return shouldUseShopifyCart()
    ? createPolicyCart('shopify')
    : createEmptyCart();
}

/**
 * Save cart to localStorage and update cache
 * @param {Object} cart - Cart object
 */
export function saveCart(cart) {
  if (typeof window === 'undefined') return;

  if (cart.source !== 'shopify') requireLocalCart();

  // Update cache
  cartCache = cart;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    
    // Also update cart ID if present
    if (cart.id) {
      storeCartId(cart.id);
    }
  } catch (e) {
    console.error('Error saving cart to localStorage:', e);
  }
}

/**
 * Calculate total quantity
 * @param {Object[]} items - Cart items
 * @returns {number} Total quantity
 */
function calculateQuantity(items) {
  return items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Get or create Shopify cart
 * Creates a new cart if none exists or if existing cart is invalid
 * @returns {Promise<Object>} Cart
 */
async function getOrCreateShopifyCart() {
  const cartId = getStoredCartId();
  const { cart, disposition } = await restoreOrCreateCart({
    cartId,
    getCart: id => shopifyClient.getCart(id),
    createCart: () => shopifyClient.createCart(),
  });
  if (disposition === 'replaced') storeCartId(null);
  storeCartId(cart.id);
  saveCart({ ...cart, source: 'shopify' });
  console.info(`[Cart] Shopify cart ${disposition}.`);
  return cart;
}

/**
 * Find Shopify variant ID from product
 * @param {Object} product - Product object
 * @param {string} color - Selected color
 * @param {string} size - Selected size
 * @returns {string|null} Variant ID
 */
function findVariantId(product, color, size) {
  // Try exact match first
  const variantKey = `${color}-${size}`;
  if (product.shopifyVariants?.[variantKey]) {
    return product.shopifyVariants[variantKey];
  }
  
  // Try with just color
  if (product.shopifyVariants?.[`${color}-One Size`]) {
    return product.shopifyVariants[`${color}-One Size`];
  }
  
  // Try with just size
  if (product.shopifyVariants?.[`Default-${size}`]) {
    return product.shopifyVariants[`Default-${size}`];
  }
  
  // Return first variant as fallback
  return product.firstVariantId || null;
}

/**
 * Add item to cart
 * Creates Shopify cart if needed, adds item via API
 * @param {Object} product - Product to add
 * @param {string} selectedColor - Selected color
 * @param {string} selectedSize - Selected size
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} Updated cart
 */
export async function addToCart(product, selectedColor, selectedSize, quantity = 1) {
  const itemKey = `${product.id}-${selectedColor}-${selectedSize}`;

  // Try Shopify cart first
  if (shouldUseShopifyCart()) {
    try {
      const variantId = findVariantId(product, selectedColor, selectedSize);
      
      if (variantId) {
        const cart = await getOrCreateShopifyCart();
        const updatedCart = await shopifyClient.addToCart(cart.id, variantId, quantity);
        const sourcedCart = { ...updatedCart, source: 'shopify' };
        saveCart(sourcedCart);
        return sourcedCart;
      }
      throw unavailableCartError(getCommerceEnvironment());
    } catch (error) {
      throw unavailableCartError(getCommerceEnvironment(), error);
    }
  }

  requireLocalCart();
  const cart = getCart();
  const updatedCart = addLocalCartLine(cart, {
    key: itemKey,
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.images?.[0] || product.heroImage || '',
    color: selectedColor,
    size: selectedSize,
    quantity,
    variantId: null,
    lineItemId: null,
  });
  saveCart(updatedCart);
  return updatedCart;
}

/**
 * Remove item from cart
 * @param {string} itemKey - Item key to remove
 * @returns {Promise<Object>} Updated cart
 */
export async function removeFromCart(itemKey) {
  const cart = getCart();
  const item = cart.items.find(i => i.key === itemKey);

  // Try Shopify cart first
  if (shouldUseShopifyCart() && item?.lineItemId && cart.id) {
    try {
      const updatedCart = await shopifyClient.removeFromCart(cart.id, item.lineItemId);
      const sourcedCart = { ...updatedCart, source: 'shopify' };
      saveCart(sourcedCart);
      return sourcedCart;
    } catch (error) {
      throw unavailableCartError(getCommerceEnvironment(), error);
    }
  }

  requireLocalCart();
  const updatedCart = removeLocalCartLine(cart, itemKey);
  saveCart(updatedCart);
  return updatedCart;
}

/**
 * Update item quantity
 * @param {string} itemKey - Item key to update
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart
 */
export async function updateQuantity(itemKey, quantity) {
  // Remove if quantity is 0 or less
  if (quantity <= 0) {
    return removeFromCart(itemKey);
  }

  const cart = getCart();
  const item = cart.items.find(i => i.key === itemKey);

  if (!item) {
    return cart;
  }

  // Try Shopify cart first
  if (shouldUseShopifyCart() && item.lineItemId && cart.id) {
    try {
      const updatedCart = await shopifyClient.updateCartLine(cart.id, item.lineItemId, quantity);
      const sourcedCart = { ...updatedCart, source: 'shopify' };
      saveCart(sourcedCart);
      return sourcedCart;
    } catch (error) {
      throw unavailableCartError(getCommerceEnvironment(), error);
    }
  }

  requireLocalCart();
  const updatedCart = updateLocalCartLine(cart, itemKey, quantity);
  saveCart(updatedCart);
  return updatedCart;
}

/**
 * Clear entire cart
 * @returns {Object} Empty cart
 */
export function clearCart() {
  if (!shouldUseShopifyCart()) requireLocalCart();
  const cart = shouldUseShopifyCart()
    ? { ...createPolicyCart('shopify'), source: 'shopify' }
    : createEmptyCart();
  saveCart(cart);
  storeCartId(null);
  cartCache = null;
  return cart;
}

/**
 * Get cart item count
 * @returns {number} Total items in cart
 */
export function getCartItemCount() {
  const cart = getCart();
  return cart.totalQuantity || calculateQuantity(cart.items);
}

/**
 * Get checkout URL
 * Returns Shopify checkout URL if available
 * @returns {string} Checkout URL
 */
export function getCheckoutUrl() {
  const cart = getCart();
  if (cart.source !== 'shopify') return '';
  return validateCheckoutUrl(cart.checkoutUrl, checkoutHosts());
}

/**
 * Check if checkout is available
 * @returns {boolean}
 */
export function isCheckoutAvailable() {
  const cart = getCart();
  return Boolean(getCheckoutUrl() && cart.items.length > 0);
}

/**
 * Redirect to checkout
 * Opens Shopify checkout in current window
 * @returns {boolean} True if redirected, false if no checkout URL
 */
export function redirectToCheckout() {
  const checkoutUrl = getCheckoutUrl();
  
  if (checkoutUrl) {
    window.location.href = checkoutUrl;
    return true;
  }
  
  console.warn('[Cart] No checkout URL available');
  return false;
}

/**
 * Sync local cart with Shopify
 * Call this on app initialization to restore cart state
 * @returns {Promise<Object>} Synced cart
 */
export async function syncCartWithShopify() {
  if (!shouldUseShopifyCart()) {
    requireLocalCart();
    return getCart();
  }

  try {
    const cartId = getStoredCartId();
    
    if (cartId) {
      const shopifyCart = await shopifyClient.getCart(cartId);
      
      if (shopifyCart && shopifyCart.id) {
        const sourcedCart = { ...shopifyCart, source: 'shopify' };
        saveCart(sourcedCart);
        return sourcedCart;
      }
      
      // Cart expired or deleted
      storeCartId(null);
    }

    return createPolicyCart('shopify');
  } catch (error) {
    if (error.code === 'SHOPIFY_CART_UNAVAILABLE') throw error;
    throw unavailableCartError(getCommerceEnvironment(), error);
  }
}

/**
 * Initialize cart on app load
 * Syncs with Shopify if configured
 * @returns {Promise<Object>} Cart
 */
export async function initializeCart() {
  if (shouldUseShopifyCart()) {
    return syncCartWithShopify();
  }
  
  return getCart();
}

/**
 * Check if using Shopify cart
 * @returns {boolean}
 */
export function isUsingShopifyCart() {
  return shouldUseShopifyCart();
}

/**
 * Get cart status for debugging
 * @returns {Object} Cart status
 */
export function getCartStatus() {
  const cart = getCart();
  const cartId = getStoredCartId();
  
  return {
    isShopifyConfigured: shouldUseShopifyCart(),
    hasCartId: Boolean(cartId),
    itemCount: cart.items.length,
    totalQuantity: cart.totalQuantity,
    total: cart.total,
    hasValidCheckoutUrl: Boolean(getCheckoutUrl()),
  };
}

const cartStore = {
  // Core operations
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  
  // Utilities
  getCartItemCount,
  getCheckoutUrl,
  isCheckoutAvailable,
  redirectToCheckout,
  
  // Shopify sync
  syncCartWithShopify,
  initializeCart,
  
  // Status
  isUsingShopifyCart,
  shouldUseShopifyCart,
  getCartStatus,
};

export default cartStore;
