/**
 * Shopify Storefront API Configuration
 * 
 * To connect to Shopify:
 * 1. Go to your Shopify Admin > Settings > Apps and sales channels
 * 2. Click "Develop apps" > Create an app
 * 3. Configure Storefront API scopes (read products, read collections, write checkouts)
 * 4. Install the app and copy the Storefront API access token
 * 5. Add credentials to .env file
 */

export const shopifyConfig = {
  // Store domain (e.g., 'your-store.myshopify.com')
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '',
  
  // Storefront API access token
  storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '',
  
  // API version (use latest stable)
  apiVersion: '2024-01',
  
  // Check if Shopify is configured
  get isConfigured() {
    return Boolean(this.storeDomain && this.storefrontAccessToken);
  },
  
  // Get full API URL
  get apiUrl() {
    return `https://${this.storeDomain}/api/${this.apiVersion}/graphql.json`;
  },
};

export default shopifyConfig;
