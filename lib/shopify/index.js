/**
 * Shopify Integration Module
 * 
 * This module provides all Shopify Storefront API functionality:
 * - Product and collection fetching
 * - Cart management
 * - Search
 * - Checkout redirection
 * 
 * Usage:
 * ```javascript
 * import { shopifyClient, isShopifyConfigured } from '@/lib/shopify';
 * 
 * // Check if Shopify is configured
 * if (isShopifyConfigured()) {
 *   const products = await shopifyClient.getProducts();
 * }
 * ```
 */

// Configuration
export { default as shopifyConfig } from '../config/shopify';

// Client (main API)
export { default as shopifyClient } from './client';
export { isShopifyConfigured } from './client';

// Individual API functions
export {
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
} from './client';

// GraphQL types and fragments
export * from './types';

// GraphQL queries
export * as queries from './queries';

// GraphQL mutations
export * as mutations from './mutations';
