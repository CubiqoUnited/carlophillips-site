import 'server-only';

import type { StorefrontApiVersion } from './types';

export const STOREFRONT_API_VERSION: StorefrontApiVersion = '2026-07';

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFragment on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    tags
    vendor
    tagline: metafield(namespace: "custom", key: "tagline") {
      value
    }
    material: metafield(namespace: "custom", key: "material") {
      value
    }
    fit: metafield(namespace: "custom", key: "fit") {
      value
    }
    care: metafield(namespace: "custom", key: "care") {
      value
    }
    sizeGuide: metafield(namespace: "custom", key: "size_guide") {
      value
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    media(first: 20) {
      edges {
        node {
          __typename
          id
          alt
          previewImage {
            url
            altText
            width
            height
          }
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
          ... on Video {
            sources {
              url
              mimeType
              format
              height
              width
            }
          }
          ... on ExternalVideo {
            embeddedUrl
            host
            originUrl
          }
          ... on Model3d {
            sources {
              url
              mimeType
              format
              filesize
            }
          }
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
          }
        }
      }
    }
    options {
      id
      name
      values
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
`;

export const GET_PRODUCTS = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          ...ProductFragment
        }
      }
    }
  }
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    attributes {
      key
      value
    }
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
              product {
                handle
                title
              }
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_CART = /* GraphQL */ `
  ${CART_FRAGMENT}
  query GetCart($id: ID!) {
    cart(id: $id) {
      ...CartFragment
    }
  }
`;

export const CREATE_CART = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const ADD_CART_LINES = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const UPDATE_CART_LINES = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const REMOVE_CART_LINES = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
