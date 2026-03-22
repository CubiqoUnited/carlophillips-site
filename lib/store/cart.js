/**
 * Cart Store with Shopify Integration Support
 * 
 * Manages cart state locally with localStorage persistence.
 * When Shopify is configured, syncs with Shopify Cart API.
 */

import shopifyConfig from '../config/shopify';
import shopifyClient from '../shopify/client';

export const CART_STORAGE_KEY = 'carlophillips_cart';
export const CART_ID_KEY = 'carlophillips_cart_id';

/**
 * Check if Shopify is configured
 */
const useShopify = () => {
  if (typeof window === 'undefined') return false;
  return shopifyConfig.isConfigured;
};

/**
 * Get stored Shopify cart ID
 */
function getStoredCartId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CART_ID_KEY);
}

/**
 * Store Shopify cart ID
 */
function storeCartId(cartId) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_ID_KEY, cartId);
}

/**
 * Get cart from localStorage
 * @returns {Object} Cart object
 */
export function getCart() {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, checkoutUrl: '' };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading cart:', e);
  }

  return { items: [], total: 0, checkoutUrl: '' };
}

/**
 * Save cart to localStorage
 * @param {Object} cart - Cart object
 */
export function saveCart(cart) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

/**
 * Calculate cart total
 * @param {Object[]} items - Cart items
 * @returns {number} Total
 */
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Add item to cart
 * @param {Object} product - Product to add
 * @param {string} selectedColor - Selected color
 * @param {string} selectedSize - Selected size
 * @param {number} quantity - Quantity to add
 * @returns {Object} Updated cart
 */
export async function addToCart(product, selectedColor, selectedSize, quantity = 1) {
  const cart = getCart();
  const itemKey = `${product.id}-${selectedColor}-${selectedSize}`;

  // If Shopify is configured, use Shopify Cart API
  if (useShopify() && product.shopifyVariants) {
    try {
      const variantKey = `${selectedColor}-${selectedSize}`;
      const variantId = product.shopifyVariants[variantKey];
      
      if (variantId) {
        let cartId = getStoredCartId();
        let shopifyCart;

        if (!cartId) {
          // Create new cart
          shopifyCart = await shopifyClient.createCart();
          cartId = shopifyCart.id;
          storeCartId(cartId);
        }

        // Add item to Shopify cart
        shopifyCart = await shopifyClient.addToCart(cartId, variantId, quantity);
        
        // Sync local cart with Shopify cart
        saveCart(shopifyCart);
        return shopifyCart;
      }
    } catch (error) {
      console.error('Shopify cart error, falling back to local cart:', error);
    }
  }

  // Local cart logic (fallback)
  const existingIndex = cart.items.findIndex(item => item.key === itemKey);

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({
      key: itemKey,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
      variantId: null, // Will be set when Shopify is connected
    });
  }

  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

/**
 * Remove item from cart
 * @param {string} itemKey - Item key to remove
 * @returns {Object} Updated cart
 */
export async function removeFromCart(itemKey) {
  const cart = getCart();
  const item = cart.items.find(i => i.key === itemKey);

  // If Shopify is configured and item has lineItemId, remove from Shopify
  if (useShopify() && item?.lineItemId) {
    try {
      const cartId = getStoredCartId();
      if (cartId) {
        const shopifyCart = await shopifyClient.removeFromCart(cartId, item.lineItemId);
        saveCart(shopifyCart);
        return shopifyCart;
      }
    } catch (error) {
      console.error('Shopify cart error, falling back to local cart:', error);
    }
  }

  // Local cart logic
  cart.items = cart.items.filter(i => i.key !== itemKey);
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

/**
 * Update item quantity
 * @param {string} itemKey - Item key to update
 * @param {number} quantity - New quantity
 * @returns {Object} Updated cart
 */
export async function updateQuantity(itemKey, quantity) {
  if (quantity <= 0) {
    return removeFromCart(itemKey);
  }

  const cart = getCart();
  const item = cart.items.find(i => i.key === itemKey);

  if (!item) return cart;

  // If Shopify is configured and item has lineItemId, update in Shopify
  if (useShopify() && item.lineItemId) {
    try {
      const cartId = getStoredCartId();
      if (cartId) {
        const shopifyCart = await shopifyClient.updateCartLine(cartId, item.lineItemId, quantity);
        saveCart(shopifyCart);
        return shopifyCart;
      }
    } catch (error) {
      console.error('Shopify cart error, falling back to local cart:', error);
    }
  }

  // Local cart logic
  item.quantity = quantity;
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

/**
 * Clear entire cart
 * @returns {Object} Empty cart
 */
export function clearCart() {
  const cart = { items: [], total: 0, checkoutUrl: '' };
  saveCart(cart);
  
  // Clear Shopify cart ID
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_ID_KEY);
  }
  
  return cart;
}

/**
 * Get cart item count
 * @returns {number} Total items in cart
 */
export function getCartItemCount() {
  const cart = getCart();
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Get checkout URL
 * For Shopify, this redirects to Shopify's checkout.
 * For mock, this could go to a placeholder page.
 */
export function getCheckoutUrl() {
  const cart = getCart();
  
  if (cart.checkoutUrl) {
    return cart.checkoutUrl;
  }
  
  // Placeholder for non-Shopify checkout
  return '/checkout';
}

/**
 * Sync local cart with Shopify (call on app init)
 */
export async function syncCartWithShopify() {
  if (!useShopify()) return;

  try {
    const cartId = getStoredCartId();
    if (cartId) {
      const shopifyCart = await shopifyClient.getCart(cartId);
      if (shopifyCart) {
        saveCart(shopifyCart);
        return shopifyCart;
      }
    }
  } catch (error) {
    console.error('Failed to sync cart with Shopify:', error);
    // Clear invalid cart ID
    localStorage.removeItem(CART_ID_KEY);
  }

  return getCart();
}

export default {
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartItemCount,
  getCheckoutUrl,
  syncCartWithShopify,
};
