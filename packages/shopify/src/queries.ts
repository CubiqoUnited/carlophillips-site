import 'server-only';

import type { StorefrontApiVersion } from './types';

export const STOREFRONT_API_VERSION: StorefrontApiVersion = '2025-10';

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
