/**
 * Data Service Layer
 * 
 * Provides a unified interface for fetching products and collections.
 * Automatically falls back to mock data when Shopify is not configured
 * or when API requests fail.
 * 
 * Usage:
 * - When Shopify is configured: fetches live data from Shopify Storefront API
 * - When Shopify is not configured: returns mock data for development
 * - On API errors: gracefully falls back to mock data
 */

import shopifyConfig from '../config/shopify';
import shopifyClient, { isShopifyConfigured } from '../shopify/client';
import { mockCollections, mockProducts } from './mock-data';

// Cache for Shopify data
let productsCache = null;
let collectionsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if cache is still valid
 */
function isCacheValid() {
  return Date.now() - cacheTimestamp < CACHE_DURATION;
}

/**
 * Clear the data cache
 */
export function clearCache() {
  productsCache = null;
  collectionsCache = null;
  cacheTimestamp = 0;
}

/**
 * Check if we should use Shopify or mock data
 * @returns {boolean}
 */
function useShopify() {
  // On server-side, check env directly
  if (typeof window === 'undefined') {
    return Boolean(
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && 
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
    );
  }
  return isShopifyConfigured();
}

/**
 * Log data source for debugging
 */
function logDataSource(source, operation) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Data Layer] ${operation}: Using ${source}`);
  }
}

// ============ COLLECTIONS ============

/**
 * Get all collections (async, with Shopify support)
 * @returns {Promise<Object[]>} Collections
 */
export async function getCollections() {
  if (useShopify()) {
    try {
      // Check cache first
      if (collectionsCache && isCacheValid()) {
        logDataSource('cache', 'getCollections');
        return collectionsCache;
      }

      logDataSource('Shopify', 'getCollections');
      const collections = await shopifyClient.getCollections();
      
      if (collections && collections.length > 0) {
        collectionsCache = collections;
        cacheTimestamp = Date.now();
        return collections;
      }
      
      // Fallback if empty response
      logDataSource('mock (empty response)', 'getCollections');
      return mockCollections;
    } catch (error) {
      console.warn('Shopify collections fetch failed, using mock data:', error.message);
      logDataSource('mock (error fallback)', 'getCollections');
      return mockCollections;
    }
  }
  
  logDataSource('mock', 'getCollections');
  return mockCollections;
}

/**
 * Get single collection by ID/handle (sync, uses mock data)
 * @param {string} id - Collection ID or handle
 * @returns {Object|null} Collection
 */
export function getCollection(id) {
  // First check cache if available
  if (collectionsCache && isCacheValid()) {
    const cached = collectionsCache.find(c => c.id === id);
    if (cached) return cached;
  }
  
  // Fallback to mock
  return mockCollections.find(c => c.id === id) || null;
}

/**
 * Get collection by ID (async, with Shopify support)
 * @param {string} id - Collection ID or handle
 * @returns {Promise<Object|null>} Collection
 */
export async function getCollectionAsync(id) {
  if (useShopify()) {
    try {
      logDataSource('Shopify', `getCollectionAsync(${id})`);
      const { collection } = await shopifyClient.getCollectionByHandle(id);
      return collection;
    } catch (error) {
      console.warn(`Shopify collection fetch failed for ${id}, using mock:`, error.message);
      return getCollection(id);
    }
  }
  
  return getCollection(id);
}

/**
 * Get featured collections
 * @returns {Object[]} Featured collections
 */
export function getFeaturedCollections() {
  // Check cache first
  if (collectionsCache && isCacheValid()) {
    return collectionsCache.filter(c => c.featured);
  }
  
  return mockCollections.filter(c => c.featured);
}

// ============ PRODUCTS ============

/**
 * Get all products (async, with Shopify support)
 * @param {number} limit - Maximum products to fetch
 * @returns {Promise<Object[]>} Products
 */
export async function getProducts(limit = 100) {
  if (useShopify()) {
    try {
      // Check cache first
      if (productsCache && isCacheValid()) {
        logDataSource('cache', 'getProducts');
        return productsCache.slice(0, limit);
      }

      logDataSource('Shopify', 'getProducts');
      const products = await shopifyClient.getProducts(limit);
      
      if (products && products.length > 0) {
        productsCache = products;
        cacheTimestamp = Date.now();
        return products;
      }
      
      // Fallback if empty response
      logDataSource('mock (empty response)', 'getProducts');
      return mockProducts.slice(0, limit);
    } catch (error) {
      console.warn('Shopify products fetch failed, using mock data:', error.message);
      logDataSource('mock (error fallback)', 'getProducts');
      return mockProducts.slice(0, limit);
    }
  }
  
  logDataSource('mock', 'getProducts');
  return mockProducts.slice(0, limit);
}

/**
 * Get products synchronously (always returns mock data for immediate UI)
 * Use this for initial render, then hydrate with async data
 * @returns {Object[]} Products
 */
export function getProductsSync() {
  // Return cached Shopify data if available
  if (productsCache && isCacheValid()) {
    return productsCache;
  }
  
  return mockProducts;
}

/**
 * Get single product by ID/handle (sync, uses mock/cache)
 * @param {string} id - Product ID or handle
 * @returns {Object|null} Product
 */
export function getProduct(id) {
  // Check cache first
  if (productsCache && isCacheValid()) {
    const cached = productsCache.find(p => p.id === id);
    if (cached) return cached;
  }
  
  // Fallback to mock
  return mockProducts.find(p => p.id === id) || null;
}

/**
 * Get product by ID (async, with Shopify support)
 * @param {string} id - Product ID or handle
 * @returns {Promise<Object|null>} Product
 */
export async function getProductAsync(id) {
  if (useShopify()) {
    try {
      logDataSource('Shopify', `getProductAsync(${id})`);
      const product = await shopifyClient.getProductByHandle(id);
      return product;
    } catch (error) {
      console.warn(`Shopify product fetch failed for ${id}, using mock:`, error.message);
      return getProduct(id);
    }
  }
  
  return getProduct(id);
}

/**
 * Get products by collection (sync, uses mock/cache)
 * @param {string} collectionId - Collection ID or handle
 * @returns {Object[]} Products in collection
 */
export function getProductsByCollection(collectionId) {
  // Check cache first
  if (productsCache && isCacheValid()) {
    return productsCache.filter(p => p.collection === collectionId);
  }
  
  return mockProducts.filter(p => p.collection === collectionId);
}

/**
 * Get products by collection (async, with Shopify support)
 * @param {string} collectionId - Collection ID or handle
 * @returns {Promise<Object[]>} Products in collection
 */
export async function getProductsByCollectionAsync(collectionId) {
  if (useShopify()) {
    try {
      logDataSource('Shopify', `getProductsByCollectionAsync(${collectionId})`);
      const products = await shopifyClient.getProductsByCollection(collectionId);
      
      if (products && products.length > 0) {
        return products;
      }
      
      // Fallback if empty
      return getProductsByCollection(collectionId);
    } catch (error) {
      console.warn(`Shopify collection products fetch failed for ${collectionId}, using mock:`, error.message);
      return getProductsByCollection(collectionId);
    }
  }
  
  return getProductsByCollection(collectionId);
}

/**
 * Get featured products
 * @param {number} limit - Number of products to return
 * @returns {Object[]} Featured products
 */
export function getFeaturedProducts(limit = 8) {
  // Check cache first
  if (productsCache && isCacheValid()) {
    return productsCache.slice(0, limit);
  }
  
  return mockProducts.slice(0, limit);
}

/**
 * Get featured products (async, with Shopify support)
 * @param {number} limit - Number of products to return
 * @returns {Promise<Object[]>} Featured products
 */
export async function getFeaturedProductsAsync(limit = 8) {
  if (useShopify()) {
    try {
      logDataSource('Shopify', `getFeaturedProductsAsync(${limit})`);
      const products = await shopifyClient.getFeaturedProducts(limit);
      
      if (products && products.length > 0) {
        return products;
      }
      
      return getFeaturedProducts(limit);
    } catch (error) {
      console.warn('Shopify featured products fetch failed, using mock:', error.message);
      return getFeaturedProducts(limit);
    }
  }
  
  return getFeaturedProducts(limit);
}

// ============ SEARCH ============

/**
 * Search products
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} Matching products
 */
export async function searchProducts(query) {
  if (useShopify()) {
    try {
      logDataSource('Shopify', `searchProducts(${query})`);
      const results = await shopifyClient.searchProducts(query);
      
      if (results && results.length > 0) {
        return results;
      }
      
      // Fallback to local search on mock data
      return searchProductsLocal(query);
    } catch (error) {
      console.warn('Shopify search failed, using local search:', error.message);
      return searchProductsLocal(query);
    }
  }
  
  return searchProductsLocal(query);
}

/**
 * Local search on mock/cached data
 * @param {string} query - Search query
 * @returns {Object[]} Matching products
 */
function searchProductsLocal(query) {
  const q = query.toLowerCase().trim();
  const data = productsCache || mockProducts;
  
  return data.filter(p => 
    p.name?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q) ||
    p.collection?.toLowerCase().includes(q) ||
    p.tagline?.toLowerCase().includes(q)
  );
}

// ============ UTILITY ============

/**
 * Check if Shopify is being used
 * @returns {boolean}
 */
export function isUsingShopify() {
  return useShopify();
}

/**
 * Get data source status
 * @returns {Object} Status info
 */
export function getDataSourceStatus() {
  return {
    isShopifyConfigured: useShopify(),
    hasCachedProducts: productsCache !== null,
    hasCachedCollections: collectionsCache !== null,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    isCacheValid: isCacheValid(),
  };
}

// Export collections and products for direct access (sync, mock data)
export const collections = mockCollections;
export const products = mockProducts;

export default {
  // Collections
  getCollections,
  getCollection,
  getCollectionAsync,
  getFeaturedCollections,
  
  // Products
  getProducts,
  getProductsSync,
  getProduct,
  getProductAsync,
  getProductsByCollection,
  getProductsByCollectionAsync,
  getFeaturedProducts,
  getFeaturedProductsAsync,
  
  // Search
  searchProducts,
  
  // Utility
  isUsingShopify,
  getDataSourceStatus,
  clearCache,
  
  // Direct access
  collections,
  products,
};
