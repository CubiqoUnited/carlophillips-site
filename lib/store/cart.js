/**
 * Cart Store with Shopify Integration
 * 
 * Manages cart state with automatic Shopify sync when configured.
 * Falls back to localStorage-only mode when Shopify is not available.
 * 
 * Features:
 * - Automatic Shopify cart creation and sync
 * - Local storage persistence for offline/fallback
 * - Seamless transition between mock and live mode
 * - Checkout URL generation (redirects to Shopify checkout)
 */

import shopifyConfig from '../config/shopify';
import shopifyClient, { isShopifyConfigured } from '../shopify/client';

// Storage keys
export const CART_STORAGE_KEY = 'carlophillips_cart';
export const CART_ID_KEY = 'carlophillips_cart_id';

/**
 * Check if Shopify cart should be used
 */
function useShopifyCart() {
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
 * Get cart from localStorage (local fallback)
 * @returns {Object} Cart object
 */
export function getCart() {
  if (typeof window === 'undefined') {
    return createEmptyCart();
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const cart = JSON.parse(stored);
      // Ensure cart has required structure
      return {
        id: cart.id || null,
        items: cart.items || [],
        total: cart.total || 0,
        checkoutUrl: cart.checkoutUrl || '',
        totalQuantity: cart.totalQuantity || 0,
      };
    }
  } catch (e) {
    console.error('Error reading cart from localStorage:', e);
  }

  return createEmptyCart();
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
    checkoutUrl: '',
    totalQuantity: 0,
  };
}

/**
 * Save cart to localStorage
 * @param {Object} cart - Cart object
 */
export function saveCart(cart) {
  if (typeof window === 'undefined') return;

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
 * @returns {Promise<Object>} Cart
 */
async function getOrCreateShopifyCart() {
  let cartId = getStoredCartId();
  
  if (cartId) {
    // Try to get existing cart
    const existingCart = await shopifyClient.getCart(cartId);
    if (existingCart && existingCart.id) {
      return existingCart;
    }
    // Cart not found or expired, clear stored ID
    storeCartId(null);
  }
  
  // Create new cart
  const newCart = await shopifyClient.createCart();
  storeCartId(newCart.id);
  saveCart(newCart);
  return newCart;
}

/**
 * Add item to cart
 * @param {Object} product - Product to add
 * @param {string} selectedColor - Selected color
 * @param {string} selectedSize - Selected size
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} Updated cart
 */
export async function addToCart(product, selectedColor, selectedSize, quantity = 1) {
  const itemKey = `${product.id}-${selectedColor}-${selectedSize}`;

  // Try Shopify cart first
  if (useShopifyCart()) {
    try {
      // Get variant ID from product
      const variantKey = `${selectedColor}-${selectedSize}`;
      const variantId = product.shopifyVariants?.[variantKey] || product.firstVariantId;
      
      if (variantId) {
        const cart = await getOrCreateShopifyCart();
        const updatedCart = await shopifyClient.addToCart(cart.id, variantId, quantity);
        saveCart(updatedCart);
        return updatedCart;
      } else {
        console.warn('No Shopify variant ID found for product, using local cart');
      }
    } catch (error) {
      console.error('Shopify cart add failed, falling back to local:', error.message);
    }
  }

  // Local cart fallback
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
  const cart = getCart();
  const item = cart.items.find(i => i.key === itemKey);

  // Try Shopify cart first
  if (useShopifyCart() && item?.lineItemId && cart.id) {
    try {
      const updatedCart = await shopifyClient.removeFromCart(cart.id, item.lineItemId);
      saveCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Shopify cart remove failed, falling back to local:', error.message);
    }
  }

  // Local cart fallback
  cart.items = cart.items.filter(i => i.key !== itemKey);
  cart.total = calculateTotal(cart.items);
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
  // Remove if quantity is 0 or less
  if (quantity <= 0) {
    return removeFromCart(itemKey);
  }

  const cart = getCart();
  const item = cart.items.find(i => i.key === itemKey);

  if (!item) return cart;

  // Try Shopify cart first
  if (useShopifyCart() && item.lineItemId && cart.id) {
    try {
      const updatedCart = await shopifyClient.updateCartLine(cart.id, item.lineItemId, quantity);
      saveCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Shopify cart update failed, falling back to local:', error.message);
    }
  }

  // Local cart fallback
  item.quantity = quantity;
  cart.total = calculateTotal(cart.items);
  cart.totalQuantity = calculateQuantity(cart.items);
  saveCart(cart);
  return cart;
}

/**
 * Clear entire cart
 * @returns {Object} Empty cart
 */
export function clearCart() {
  const cart = createEmptyCart();
  saveCart(cart);
  storeCartId(null);
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
 * Returns Shopify checkout URL if available, otherwise a placeholder
 * @returns {string} Checkout URL
 */
export function getCheckoutUrl() {
  const cart = getCart();
  
  // Use Shopify checkout URL if available
  if (cart.checkoutUrl) {
    return cart.checkoutUrl;
  }
  
  // Placeholder for non-Shopify checkout
  return '/checkout';
}

/**
 * Redirect to checkout
 * Opens Shopify checkout in current window
 */
export function redirectToCheckout() {
  const checkoutUrl = getCheckoutUrl();
  
  if (checkoutUrl && checkoutUrl !== '/checkout') {
    window.location.href = checkoutUrl;
  } else {
    console.warn('No Shopify checkout URL available');
    // Could show a modal or handle differently
  }
}

/**
 * Sync local cart with Shopify
 * Call this on app initialization to restore cart state
 * @returns {Promise<Object>} Synced cart
 */
export async function syncCartWithShopify() {
  if (!useShopifyCart()) {
    return getCart();
  }

  try {
    const cartId = getStoredCartId();
    
    if (cartId) {
      const shopifyCart = await shopifyClient.getCart(cartId);
      
      if (shopifyCart && shopifyCart.id) {
        saveCart(shopifyCart);
        return shopifyCart;
      }
      
      // Cart expired or deleted, clear stored ID
      storeCartId(null);
    }
    
    // Return local cart or empty cart
    return getCart();
  } catch (error) {
    console.error('Failed to sync cart with Shopify:', error.message);
    return getCart();
  }
}

/**
 * Merge local cart with Shopify cart
 * Useful when user logs in or Shopify becomes available
 * @returns {Promise<Object>} Merged cart
 */
export async function mergeWithShopifyCart() {
  if (!useShopifyCart()) {
    return getCart();
  }

  const localCart = getCart();
  
  // If no local items, just sync with Shopify
  if (localCart.items.length === 0) {
    return syncCartWithShopify();
  }

  try {
    // Get or create Shopify cart
    const shopifyCart = await getOrCreateShopifyCart();
    
    // If local cart has items without lineItemIds, try to add them to Shopify
    const itemsToAdd = localCart.items.filter(item => !item.lineItemId && item.variantId);
    
    if (itemsToAdd.length > 0) {
      const lines = itemsToAdd.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      
      const updatedCart = await shopifyClient.addMultipleToCart(shopifyCart.id, lines);
      saveCart(updatedCart);
      return updatedCart;
    }
    
    return shopifyCart;
  } catch (error) {
    console.error('Failed to merge cart with Shopify:', error.message);
    return localCart;
  }
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
    isShopifyCart: useShopifyCart(),
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
  redirectToCheckout,
  
  // Shopify sync
  syncCartWithShopify,
  mergeWithShopifyCart,
  
  // Status
  isUsingShopifyCart,
  getCartStatus,
};
