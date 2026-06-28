/**
 * Shopify Storefront API GraphQL Queries
 */

import { PRODUCT_FRAGMENT, COLLECTION_FRAGMENT } from './types';

// Get all products
export const GET_PRODUCTS = `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int = 50, $sortKey: ProductSortKeys = BEST_SELLING) {
    products(first: $first, sortKey: $sortKey) {
      edges {
        node {
          ...ProductFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Get single product by handle
export const GET_PRODUCT_BY_HANDLE = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
`;

// Get products by collection handle
export const GET_PRODUCTS_BY_COLLECTION = `
  ${PRODUCT_FRAGMENT}
  ${COLLECTION_FRAGMENT}
  query GetProductsByCollection($handle: String!, $first: Int = 50) {
    collection(handle: $handle) {
      ...CollectionFragment
      products(first: $first) {
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  }
`;

// Get all collections
export const GET_COLLECTIONS = `
  ${COLLECTION_FRAGMENT}
  query GetCollections($first: Int = 20) {
    collections(first: $first) {
      edges {
        node {
          ...CollectionFragment
        }
      }
    }
  }
`;

// Get single collection by handle
export const GET_COLLECTION_BY_HANDLE = `
  ${COLLECTION_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  query GetCollectionByHandle($handle: String!, $productsFirst: Int = 50) {
    collection(handle: $handle) {
      ...CollectionFragment
      products(first: $productsFirst) {
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  }
`;

// Search products
export const SEARCH_PRODUCTS = `
  ${PRODUCT_FRAGMENT}
  query SearchProducts($query: String!, $first: Int = 20) {
    search(query: $query, first: $first, types: PRODUCT) {
      edges {
        node {
          ... on Product {
            ...ProductFragment
          }
        }
      }
    }
  }
`;

// Get featured products (by tag or collection)
export const GET_FEATURED_PRODUCTS = `
  ${PRODUCT_FRAGMENT}
  query GetFeaturedProducts($first: Int = 8) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
          ...ProductFragment
        }
      }
    }
  }
`;
