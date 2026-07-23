/**
 * Data Service Layer
 * 
 * Provides a unified interface for fetching products and collections.
 * Local development may use explicit fixtures. Preview and production fail
 * closed when Shopify is unavailable; they never substitute fixture products.
 * 
 * Usage:
 * - When Shopify is configured: fetches live data from Shopify Storefront API
 * - When Shopify is not configured: returns mock data for development
 * - On API errors: gracefully falls back to mock data
 */

import shopifyClient, { isShopifyConfigured } from '../shopify/client';
import { canUseFixtureData } from '../config/product-visibility';
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
function shouldUseShopify() {
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

function fixturesOrThrow(fixtures, operation, cause = null) {
  if (canUseFixtureData()) {
    logDataSource('local fixture', operation);
    return fixtures;
  }

  const error = new Error(`${operation}: Shopify data unavailable and fixtures are forbidden`);
  error.code = 'COMMERCE_SOURCE_UNAVAILABLE';
  if (cause) error.cause = cause;
  throw error;
}

// ============ COLLECTIONS ============

/**
 * Get all collections (async, with Shopify support)
 * @returns {Promise<Object[]>} Collections
 */
export async function getCollections() {
  if (shouldUseShopify()) {
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
      
      return fixturesOrThrow(mockCollections, 'getCollections (empty Shopify response)');
    } catch (error) {
      return fixturesOrThrow(mockCollections, 'getCollections (Shopify request failed)', error);
    }
  }

  return fixturesOrThrow(mockCollections, 'getCollections (Shopify not configured)');
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
  return fixturesOrThrow(mockCollections, `getCollection(${id})`).find(c => c.id === id) || null;
}

/**
 * Get collection by ID (async, with Shopify support)
 * @param {string} id - Collection ID or handle
 * @returns {Promise<Object|null>} Collection
 */
export async function getCollectionAsync(id) {
  if (shouldUseShopify()) {
    try {
      logDataSource('Shopify', `getCollectionAsync(${id})`);
      const { collection } = await shopifyClient.getCollectionByHandle(id);
      return collection;
    } catch (error) {
      return fixturesOrThrow(mockCollections, `getCollectionAsync(${id})`, error).find(c => c.id === id) || null;
    }
  }
  
  return fixturesOrThrow(mockCollections, `getCollectionAsync(${id}) (Shopify not configured)`).find(c => c.id === id) || null;
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
  
  return fixturesOrThrow(mockCollections, 'getFeaturedCollections').filter(c => c.featured);
}

// ============ PRODUCTS ============

/**
 * Get all products (async, with Shopify support)
 * @param {number} limit - Maximum products to fetch
 * @returns {Promise<Object[]>} Products
 */
export async function getProducts(limit = 100) {
  if (shouldUseShopify()) {
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
      
      return fixturesOrThrow(mockProducts, 'getProducts (empty Shopify response)').slice(0, limit);
    } catch (error) {
      return fixturesOrThrow(mockProducts, 'getProducts (Shopify request failed)', error).slice(0, limit);
    }
  }

  return fixturesOrThrow(mockProducts, 'getProducts (Shopify not configured)').slice(0, limit);
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
  
  return fixturesOrThrow(mockProducts, 'getProductsSync');
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
  return fixturesOrThrow(mockProducts, `getProduct(${id})`).find(p => p.id === id) || null;
}

/**
 * Get product by ID (async, with Shopify support)
 * @param {string} id - Product ID or handle
 * @returns {Promise<Object|null>} Product
 */
export async function getProductAsync(id) {
  if (shouldUseShopify()) {
    try {
      logDataSource('Shopify', `getProductAsync(${id})`);
      const product = await shopifyClient.getProductByHandle(id);
      return product;
    } catch (error) {
      return fixturesOrThrow(mockProducts, `getProductAsync(${id})`, error).find(p => p.id === id) || null;
    }
  }
  
  return fixturesOrThrow(mockProducts, `getProductAsync(${id}) (Shopify not configured)`).find(p => p.id === id) || null;
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
  
  return fixturesOrThrow(mockProducts, `getProductsByCollection(${collectionId})`).filter(p => p.collection === collectionId);
}

/**
 * Get products by collection (async, with Shopify support)
 * @param {string} collectionId - Collection ID or handle
 * @returns {Promise<Object[]>} Products in collection
 */
export async function getProductsByCollectionAsync(collectionId) {
  if (shouldUseShopify()) {
    try {
      logDataSource('Shopify', `getProductsByCollectionAsync(${collectionId})`);
      const products = await shopifyClient.getProductsByCollection(collectionId);
      
      if (products && products.length > 0) {
        return products;
      }
      
      // Fallback if empty
      return fixturesOrThrow(mockProducts, `getProductsByCollectionAsync(${collectionId}) (empty Shopify response)`).filter(p => p.collection === collectionId);
    } catch (error) {
      return fixturesOrThrow(mockProducts, `getProductsByCollectionAsync(${collectionId})`, error).filter(p => p.collection === collectionId);
    }
  }
  
  return fixturesOrThrow(mockProducts, `getProductsByCollectionAsync(${collectionId}) (Shopify not configured)`).filter(p => p.collection === collectionId);
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
  
  return fixturesOrThrow(mockProducts, 'getFeaturedProducts').slice(0, limit);
}

/**
 * Get featured products (async, with Shopify support)
 * @param {number} limit - Number of products to return
 * @returns {Promise<Object[]>} Featured products
 */
export async function getFeaturedProductsAsync(limit = 8) {
  if (shouldUseShopify()) {
    try {
      logDataSource('Shopify', `getFeaturedProductsAsync(${limit})`);
      const products = await shopifyClient.getFeaturedProducts(limit);
      
      if (products && products.length > 0) {
        return products;
      }
      
      return fixturesOrThrow(mockProducts, 'getFeaturedProductsAsync (empty Shopify response)').slice(0, limit);
    } catch (error) {
      return fixturesOrThrow(mockProducts, 'getFeaturedProductsAsync', error).slice(0, limit);
    }
  }
  
  return fixturesOrThrow(mockProducts, 'getFeaturedProductsAsync (Shopify not configured)').slice(0, limit);
}

// ============ SEARCH ============

/**
 * Search products
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} Matching products
 */
export async function searchProducts(query) {
  if (shouldUseShopify()) {
    try {
      logDataSource('Shopify', `searchProducts(${query})`);
      const results = await shopifyClient.searchProducts(query);
      
      if (results && results.length > 0) {
        return results;
      }
      
      return searchProductsLocal(query);
    } catch (error) {
      if (!canUseFixtureData()) {
        return fixturesOrThrow(mockProducts, `searchProducts(${query})`, error);
      }
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
  const data = productsCache || fixturesOrThrow(mockProducts, `searchProductsLocal(${query})`);
  
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
  return shouldUseShopify();
}

/**
 * Get data source status
 * @returns {Object} Status info
 */
export function getDataSourceStatus() {
  return {
    isShopifyConfigured: shouldUseShopify(),
    hasCachedProducts: productsCache !== null,
    hasCachedCollections: collectionsCache !== null,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    isCacheValid: isCacheValid(),
  };
}

const productDataService = {
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
};

export default productDataService;
