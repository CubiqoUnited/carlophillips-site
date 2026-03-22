/**
 * Shopify Storefront API Configuration
 * 
 * This module provides configuration for connecting to Shopify's Storefront API.
 * The Storefront API is a GraphQL API that allows you to build custom storefronts.
 * 
 * SETUP INSTRUCTIONS:
 * ==================
 * 1. Log into your Shopify Admin panel
 * 2. Go to Settings > Apps and sales channels
 * 3. Click "Develop apps" (you may need to enable this first)
 * 4. Click "Create an app" and name it (e.g., "Carlophillips Storefront")
 * 5. Go to "API credentials" tab
 * 6. Click "Configure Storefront API scopes" and enable:
 *    - unauthenticated_read_product_listings
 *    - unauthenticated_read_product_inventory
 *    - unauthenticated_read_product_tags
 *    - unauthenticated_write_checkouts
 *    - unauthenticated_read_checkouts
 *    - unauthenticated_read_content
 * 7. Click "Install app"
 * 8. Copy the "Storefront API access token"
 * 9. Add to your .env file:
 *    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *    NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_token_here
 * 
 * IMPORTANT NOTES:
 * ===============
 * - The Storefront API token is safe to expose in frontend code
 * - It only allows read operations and checkout creation
 * - For admin operations, use the Admin API with server-side code only
 * - The API version should match your Shopify store's API version
 */

/**
 * Shopify configuration object
 */
export const shopifyConfig = {
  /**
   * Shopify store domain (without https://)
   * Example: 'your-store.myshopify.com'
   */
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '',
  
  /**
   * Storefront API access token
   * This is safe to expose in frontend code
   */
  storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '',
  
  /**
   * API version to use
   * Update this to match your Shopify store's API version
   * Latest stable versions: 2024-01, 2024-04, 2024-07
   */
  apiVersion: '2024-01',
  
  /**
   * Check if Shopify is properly configured
   * Returns true if both domain and token are set
   */
  get isConfigured() {
    return Boolean(this.storeDomain && this.storefrontAccessToken);
  },
  
  /**
   * Get the full Storefront API URL
   */
  get apiUrl() {
    if (!this.storeDomain) return '';
    return `https://${this.storeDomain}/api/${this.apiVersion}/graphql.json`;
  },
  
  /**
   * Get the store's main URL
   */
  get storeUrl() {
    if (!this.storeDomain) return '';
    return `https://${this.storeDomain}`;
  },
  
  /**
   * Get configuration status for debugging
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      hasDomain: Boolean(this.storeDomain),
      hasToken: Boolean(this.storefrontAccessToken),
      apiVersion: this.apiVersion,
      apiUrl: this.apiUrl,
    };
  },
};

/**
 * Validate configuration and log warnings in development
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if (!shopifyConfig.isConfigured) {
    console.info(
      '%c[Shopify] Running in mock mode - Shopify not configured',
      'color: #f59e0b; font-weight: bold'
    );
    console.info(
      'To connect Shopify, add these environment variables:\\n' +
      '  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com\\n' +
      '  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_token'
    );
  } else {
    console.info(
      '%c[Shopify] Connected to ' + shopifyConfig.storeDomain,
      'color: #10b981; font-weight: bold'
    );
  }
}

export default shopifyConfig;
