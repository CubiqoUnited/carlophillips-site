/**
 * Cart Store with Full Shopify Integration
 * 
 * Manages cart state with automatic Shopify sync when configured.
 * Falls back to localStorage-only mode when Shopify is not available.
 * 
 * Features:
 * - Automatic Shopify cart creation on first add
 * - Persistent cart ID in localStorage
 * - Real-time sync with Shopify Cart API
 * - Checkout URL generation (redirects to Shopify)
 * - Graceful fallback to local cart
 */

import shopifyConfig from '../config/shopify';
import shopifyClient, { isShopifyConfigured } from '../shopify/client';

// Storage keys
export const CART_STORAGE_KEY = 'carlophillips_cart';
export const CART_ID_KEY = 'carlophillips_cart_id';

// In-memory cache for cart state
let cartCache = null;

/**
 * Check if Shopify cart should be used
 */
export function useShopifyCart() {
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
  return {
    id: null,
    items: [],
    total: 0,
    subtotal: 0,
    checkoutUrl: '',
    totalQuantity: 0,
  };
}

/**
 * Get cart from localStorage
 * @returns {Object} Cart object
 */
export function getCart() {
  if (typeof window === 'undefined') {
    return createEmptyCart();
  }

  // Return cached cart if available
  if (cartCache) {
    return cartCache;
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const cart = JSON.parse(stored);
      // Ensure cart has required structure
      cartCache = {
        id: cart.id || null,
        items: cart.items || [],
        total: cart.total || 0,
        subtotal: cart.subtotal || cart.total || 0,
        checkoutUrl: cart.checkoutUrl || '',
        totalQuantity: cart.totalQuantity || 0,
      };
      return cartCache;
    }
  } catch (e) {
    console.error('Error reading cart from localStorage:', e);
  }

  return createEmptyCart();
}

/**
 * Save cart to localStorage and update cache
 * @param {Object} cart - Cart object
 */
export function saveCart(cart) {
  if (typeof window === 'undefined') return;

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
 * Calculate cart total from items
 * @param {Object[]} items - Cart items
 * @returns {number} Total
 */
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
  
  if (cartId) {
    try {
      // Try to get existing cart
      const existingCart = await shopifyClient.getCart(cartId);
      if (existingCart && existingCart.id) {
        saveCart(existingCart);
        return existingCart;
      }
    } catch (error) {
      console.warn('Existing cart not found or expired:', error.message);
    }
    // Cart not found or expired, clear stored ID
    storeCartId(null);
  }
  
  // Create new cart
  console.log('[Cart] Creating new Shopify cart...');
  const newCart = await shopifyClient.createCart();
  storeCartId(newCart.id);
  saveCart(newCart);
  console.log('[Cart] New Shopify cart created:', newCart.id);
  return newCart;
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
  console.log(`[Cart] Adding to cart: ${product.name} (${selectedColor}/${selectedSize})`);

  // Try Shopify cart first
  if (useShopifyCart()) {
    try {
      const variantId = findVariantId(product, selectedColor, selectedSize);
      
      if (variantId) {
        console.log('[Cart] Using Shopify cart, variant:', variantId);
        const cart = await getOrCreateShopifyCart();
        const updatedCart = await shopifyClient.addToCart(cart.id, variantId, quantity);
        saveCart(updatedCart);
        console.log('[Cart] Item added to Shopify cart');
        return updatedCart;
      } else {
        console.warn('[Cart] No Shopify variant ID found, using local cart');
      }
    } catch (error) {
      console.error('[Cart] Shopify cart add failed:', error.message);
      console.log('[Cart] Falling back to local cart');
    }
  }

  // Local cart fallback
  console.log('[Cart] Using local cart');
  const cart = getCart();
  const existingIndex = cart.items.findIndex(item => item.key === itemKey);

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({
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
  }

  cart.total = calculateTotal(cart.items);
  cart.subtotal = cart.total;
  cart.totalQuantity = calculateQuantity(cart.items);
  saveCart(cart);
  return cart;
}

/**
 * Remove item from cart
 * @param {string} itemKey - Item key to remove
 * @returns {Promise<Object>} Updated cart
 */
export async function removeFromCart(itemKey) {
  console.log(`[Cart] Removing item: ${itemKey}`);
  const cart = getCart();
  const item = cart.items.find(i => i.key === itemKey);

  // Try Shopify cart first
  if (useShopifyCart() && item?.lineItemId && cart.id) {
    try {
      console.log('[Cart] Removing from Shopify cart:', item.lineItemId);
      const updatedCart = await shopifyClient.removeFromCart(cart.id, item.lineItemId);
      saveCart(updatedCart);
      console.log('[Cart] Item removed from Shopify cart');
      return updatedCart;
    } catch (error) {
      console.error('[Cart] Shopify remove failed:', error.message);
    }
  }

  // Local cart fallback
  cart.items = cart.items.filter(i => i.key !== itemKey);
  cart.total = calculateTotal(cart.items);
  cart.subtotal = cart.total;
  cart.totalQuantity = calculateQuantity(cart.items);
  saveCart(cart);
  return cart;
}

/**
 * Update item quantity
 * @param {string} itemKey - Item key to update
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart
 */
export async function updateQuantity(itemKey, quantity) {
  console.log(`[Cart] Updating quantity: ${itemKey} -> ${quantity}`);
  
  // Remove if quantity is 0 or less
  if (quantity <= 0) {
    return removeFromCart(itemKey);
  }

  const cart = getCart();
  const item = cart.items.find(i => i.key === itemKey);

  if (!item) {
    console.warn('[Cart] Item not found:', itemKey);
    return cart;
  }

  // Try Shopify cart first
  if (useShopifyCart() && item.lineItemId && cart.id) {
    try {
      console.log('[Cart] Updating Shopify cart line:', item.lineItemId);
      const updatedCart = await shopifyClient.updateCartLine(cart.id, item.lineItemId, quantity);
      saveCart(updatedCart);
      console.log('[Cart] Shopify cart updated');
      return updatedCart;
    } catch (error) {
      console.error('[Cart] Shopify update failed:', error.message);
    }
  }

  // Local cart fallback
  item.quantity = quantity;
  cart.total = calculateTotal(cart.items);
  cart.subtotal = cart.total;
  cart.totalQuantity = calculateQuantity(cart.items);
  saveCart(cart);
  return cart;
}

/**
 * Clear entire cart
 * @returns {Object} Empty cart
 */
export function clearCart() {
  console.log('[Cart] Clearing cart');
  const cart = createEmptyCart();
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
  
  // Use Shopify checkout URL if available
  if (cart.checkoutUrl) {
    return cart.checkoutUrl;
  }
  
  // Return empty string if no checkout available
  return '';
}

/**
 * Check if checkout is available
 * @returns {boolean}
 */
export function isCheckoutAvailable() {
  const cart = getCart();
  return Boolean(cart.checkoutUrl && cart.items.length > 0);
}

/**
 * Redirect to checkout
 * Opens Shopify checkout in current window
 * @returns {boolean} True if redirected, false if no checkout URL
 */
export function redirectToCheckout() {
  const checkoutUrl = getCheckoutUrl();
  
  if (checkoutUrl) {
    console.log('[Cart] Redirecting to checkout:', checkoutUrl);
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
  console.log('[Cart] Syncing with Shopify...');
  
  if (!useShopifyCart()) {
    console.log('[Cart] Shopify not configured, using local cart');
    return getCart();
  }

  try {
    const cartId = getStoredCartId();
    
    if (cartId) {
      console.log('[Cart] Found existing cart ID:', cartId);
      const shopifyCart = await shopifyClient.getCart(cartId);
      
      if (shopifyCart && shopifyCart.id) {
        console.log('[Cart] Cart synced with Shopify');
        saveCart(shopifyCart);
        return shopifyCart;
      }
      
      // Cart expired or deleted
      console.log('[Cart] Cart expired, clearing stored ID');
      storeCartId(null);
    }
    
    // Return local cart
    return getCart();
  } catch (error) {
    console.error('[Cart] Failed to sync with Shopify:', error.message);
    return getCart();
  }
}

/**
 * Initialize cart on app load
 * Syncs with Shopify if configured
 * @returns {Promise<Object>} Cart
 */
export async function initializeCart() {
  console.log('[Cart] Initializing...');
  
  if (useShopifyCart()) {
    return syncCartWithShopify();
  }
  
  return getCart();
}

/**
 * Check if using Shopify cart
 * @returns {boolean}
 */
export function isUsingShopifyCart() {
  return useShopifyCart();
}

/**
 * Get cart status for debugging
 * @returns {Object} Cart status
 */
export function getCartStatus() {
  const cart = getCart();
  const cartId = getStoredCartId();
  
  return {
    isShopifyConfigured: useShopifyCart(),
    hasCartId: Boolean(cartId),
    cartId: cartId,
    itemCount: cart.items.length,
    totalQuantity: cart.totalQuantity,
    total: cart.total,
    hasCheckoutUrl: Boolean(cart.checkoutUrl),
    checkoutUrl: cart.checkoutUrl,
  };
}

export default {
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
  useShopifyCart,
  getCartStatus,
};
