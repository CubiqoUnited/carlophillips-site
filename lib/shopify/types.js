/**
 * Shopify Storefront API Type Definitions
 * These mirror Shopify's GraphQL schema for type safety
 */

/**
 * @typedef {Object} Money
 * @property {string} amount - The decimal money amount
 * @property {string} currencyCode - The currency code (e.g., 'USD')
 */

/**
 * @typedef {Object} Image
 * @property {string} url - The image URL
 * @property {string} altText - Alt text for accessibility
 * @property {number} width - Image width
 * @property {number} height - Image height
 */

/**
 * @typedef {Object} ProductVariant
 * @property {string} id - Shopify variant ID (base64 encoded)
 * @property {string} title - Variant title (e.g., 'Black / M')
 * @property {Money} price - Variant price
 * @property {boolean} availableForSale - Whether variant is in stock
 * @property {Object} selectedOptions - Array of selected options
 * @property {Image} image - Variant image
 */

/**
 * @typedef {Object} ProductOption
 * @property {string} id - Option ID
 * @property {string} name - Option name (e.g., 'Color', 'Size')
 * @property {string[]} values - Available values
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Shopify product ID (base64 encoded)
 * @property {string} handle - URL-friendly handle
 * @property {string} title - Product title
 * @property {string} description - Product description
 * @property {string} descriptionHtml - HTML description
 * @property {Money} priceRange - Min/max price range
 * @property {Image[]} images - Product images
 * @property {Object[]} media - Product media, including images, videos, external videos, and 3D models
 * @property {ProductVariant[]} variants - Product variants
 * @property {ProductOption[]} options - Product options
 * @property {string} productType - Product type/category
 * @property {string[]} tags - Product tags
 * @property {string} vendor - Product vendor
 */

/**
 * @typedef {Object} Collection
 * @property {string} id - Shopify collection ID
 * @property {string} handle - URL-friendly handle
 * @property {string} title - Collection title
 * @property {string} description - Collection description
 * @property {Image} image - Collection image
 * @property {Product[]} products - Products in collection
 */

/**
 * @typedef {Object} CartLineItem
 * @property {string} id - Line item ID
 * @property {number} quantity - Item quantity
 * @property {ProductVariant} merchandise - The product variant
 * @property {Money} cost - Line item cost
 */

/**
 * @typedef {Object} Cart
 * @property {string} id - Cart ID
 * @property {string} checkoutUrl - Shopify checkout URL
 * @property {CartLineItem[]} lines - Cart line items
 * @property {Money} cost - Total cart cost
 * @property {number} totalQuantity - Total items in cart
 */

/**
 * Normalized product for app use
 * @typedef {Object} NormalizedProduct
 * @property {string} id - Product ID or handle
 * @property {string} name - Product name
 * @property {string} collection - Collection handle
 * @property {number} price - Product price
 * @property {string} tagline - Short product tagline
 * @property {string} description - Full description
 * @property {string[]} details - Product details list
 * @property {string[]} images - Image URLs
 * @property {Object[]} media - Rich Shopify media
 * @property {string} heroImage - Hero image URL
 * @property {Object} variants - { colors: string[], sizes: string[] }
 * @property {string} shopifyId - Original Shopify ID
 * @property {Object} shopifyVariants - Map of variant options to Shopify variant IDs
 */

/**
 * Normalized collection for app use
 * @typedef {Object} NormalizedCollection
 * @property {string} id - Collection handle
 * @property {string} name - Collection name
 * @property {string} description - Collection description
 * @property {string} image - Collection image URL
 * @property {boolean} featured - Whether featured on homepage
 */

/**
 * Normalized cart item for app use
 * @typedef {Object} NormalizedCartItem
 * @property {string} key - Unique item key
 * @property {string} productId - Product ID
 * @property {string} name - Product name
 * @property {number} price - Item price
 * @property {string} image - Product image
 * @property {string} color - Selected color
 * @property {string} size - Selected size
 * @property {number} quantity - Quantity
 * @property {string} variantId - Shopify variant ID
 * @property {string} lineItemId - Shopify line item ID (for updates)
 */

export const PRODUCT_FRAGMENT = `
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
          id
          alt
          mediaContentType
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

export const COLLECTION_FRAGMENT = `
  fragment CollectionFragment on Collection {
    id
    handle
    title
    description
    image {
      url
      altText
      width
      height
    }
  }
`;

export const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
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
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
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
              product {
                id
                handle
                title
              }
            }
          }
        }
      }
    }
  }
`;
