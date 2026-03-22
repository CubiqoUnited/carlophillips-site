/**
 * Data Service Layer
 * 
 * Provides a unified interface for fetching products and collections.
 * Automatically falls back to mock data when Shopify is not configured.
 */

import shopifyConfig from '../config/shopify';
import shopifyClient from '../shopify/client';
import { mockCollections, mockProducts } from './mock-data';

// Check if we should use Shopify or mock data
const useShopify = () => {
  if (typeof window === 'undefined') {
    // Server-side: check env directly
    return Boolean(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN);
  }
  return shopifyConfig.isConfigured;
};

/**
 * Get all collections
 * @returns {Promise<Object[]>} Collections
 */
export async function getCollections() {
  if (useShopify()) {
    try {
      return await shopifyClient.getCollections();
    } catch (error) {
      console.warn('Shopify fetch failed, falling back to mock data:', error.message);
      return mockCollections;
    }
  }
  return mockCollections;
}

/**
 * Get single collection by ID/handle
 * @param {string} id - Collection ID or handle
 * @returns {Object|null} Collection
 */
export function getCollection(id) {
  return mockCollections.find(c => c.id === id) || null;
}

/**
 * Get featured collections
 * @returns {Object[]} Featured collections
 */
export function getFeaturedCollections() {
  return mockCollections.filter(c => c.featured);
}

/**
 * Get all products
 * @returns {Promise<Object[]>} Products
 */
export async function getProducts() {
  if (useShopify()) {
    try {
      return await shopifyClient.getProducts();
    } catch (error) {
      console.warn('Shopify fetch failed, falling back to mock data:', error.message);
      return mockProducts;
    }
  }
  return mockProducts;
}

/**
 * Get products synchronously (for client-side)
 * @returns {Object[]} Products
 */
export function getProductsSync() {
  return mockProducts;
}

/**
 * Get single product by ID/handle
 * @param {string} id - Product ID or handle
 * @returns {Object|null} Product
 */
export function getProduct(id) {
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
      return await shopifyClient.getProductByHandle(id);
    } catch (error) {
      console.warn('Shopify fetch failed, falling back to mock data:', error.message);
      return getProduct(id);
    }
  }
  return getProduct(id);
}

/**
 * Get products by collection
 * @param {string} collectionId - Collection ID or handle
 * @returns {Object[]} Products in collection
 */
export function getProductsByCollection(collectionId) {
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
      return await shopifyClient.getProductsByCollection(collectionId);
    } catch (error) {
      console.warn('Shopify fetch failed, falling back to mock data:', error.message);
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
  return mockProducts.slice(0, limit);
}

/**
 * Search products
 * @param {string} query - Search query
 * @returns {Promise<Object[]>} Matching products
 */
export async function searchProducts(query) {
  if (useShopify()) {
    try {
      return await shopifyClient.searchProducts(query);
    } catch (error) {
      console.warn('Shopify search failed, falling back to mock data:', error.message);
    }
  }
  
  // Simple mock search
  const q = query.toLowerCase();
  return mockProducts.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.collection.toLowerCase().includes(q)
  );
}

// Export collections and products for direct access
export const collections = mockCollections;
export const products = mockProducts;

export default {
  getCollections,
  getCollection,
  getFeaturedCollections,
  getProducts,
  getProductsSync,
  getProduct,
  getProductAsync,
  getProductsByCollection,
  getProductsByCollectionAsync,
  getFeaturedProducts,
  searchProducts,
  collections,
  products,
};
