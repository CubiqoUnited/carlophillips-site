# Carlophillips - Production-Ready Headless Storefront

## Project Overview
Premium luxury ecommerce website for Carlophillips - a modern **male-dominant, unisex, metrosexual** lifestyle brand. Built with a headless commerce architecture ready for Shopify integration.

---

## Architecture

### Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes, MongoDB
- **Commerce:** Shopify Storefront API (headless)
- **Design:** Vollebak-inspired premium aesthetic

### Folder Structure
```
/app
├── app/
│   ├── page.js                    # Main app with all components
│   ├── layout.js                  # Root layout
│   ├── globals.css                # Global styles (dark theme)
│   └── api/[[...path]]/route.js   # Backend API
├── lib/
│   ├── config/
│   │   └── shopify.js             # Shopify configuration
│   ├── shopify/
│   │   ├── index.js               # Module exports
│   │   ├── client.js              # Storefront API client
│   │   ├── types.js               # GraphQL types & fragments
│   │   ├── queries.js             # GraphQL queries
│   │   └── mutations.js           # Cart mutations
│   ├── data/
│   │   ├── products.js            # Data service layer (auto-fallback)
│   │   └── mock-data.js           # Mock data for development
│   └── store/
│       └── cart.js                # Cart management
└── .env                           # Environment variables
```

---

## Shopify Integration

### Quick Start
1. Add to `.env`:
```bash
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_token
```
2. Restart server: `sudo supervisorctl restart nextjs`
3. App automatically switches from mock data to live Shopify data

### Setup Instructions
1. Log into Shopify Admin
2. Go to Settings > Apps and sales channels > Develop apps
3. Create app named "Carlophillips Storefront"
4. Configure Storefront API scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_read_content`
5. Install app and copy Storefront API access token

### API Features

#### Products
```javascript
import { getProducts, getProductAsync } from '@/lib/data/products';

// Get all products (with Shopify or mock fallback)
const products = await getProducts();

// Get single product
const product = await getProductAsync('bomber-jacket');
```

#### Collections
```javascript
import { getCollections, getCollectionAsync } from '@/lib/data/products';

const collections = await getCollections();
const essentials = await getCollectionAsync('essentials');
```

#### Cart
```javascript
import { addToCart, getCart, updateQuantity, getCheckoutUrl } from '@/lib/store/cart';

// Add to cart (works with both mock and Shopify)
await addToCart(product, 'Black', 'M', 1);

// Get checkout URL (redirects to Shopify checkout when connected)
const checkoutUrl = getCheckoutUrl();
```

### Production Safety
- **Automatic fallback:** If Shopify fails, app uses mock data
- **Retry logic:** 3 retries with exponential backoff
- **Request timeout:** 10 second timeout
- **Rate limiting:** Handles Shopify throttling gracefully
- **Cache:** 5-minute cache for products/collections
- **Graceful degradation:** UI never breaks

---

## Data Layer

### Mock Data (lib/data/mock-data.js)
Male/metrosexual focused product catalog:
- **Essentials:** Tees, hoodies, crewnecks, joggers
- **Outerwear:** Bomber jackets, overshirts, vests
- **Accessories:** Leather backpack, cardholder, belt, cap
- **Jewelry & Watches:** Cuban chains, signet rings, bracelets, field watches
- **Home & Living:** Wool throws, ceramic mugs, candles

### Service Layer (lib/data/products.js)
```javascript
// Sync methods (immediate, uses mock/cache)
getProduct(id)
getProductsSync()
getProductsByCollection(collectionId)
getFeaturedProducts(limit)

// Async methods (with Shopify support)
getProductAsync(id)
getProducts(limit)
getProductsByCollectionAsync(collectionId)
searchProducts(query)
```

---

## Cart System

### Local Mode (No Shopify)
- Cart stored in localStorage
- Full functionality for development
- Checkout button shows placeholder

### Shopify Mode (With Credentials)
- Cart created via Shopify Cart API
- Items synced with Shopify
- Checkout redirects to Shopify hosted checkout

### API
```javascript
// Core operations
getCart()           // Get current cart
addToCart(...)      // Add item
removeFromCart(key) // Remove item
updateQuantity(...) // Update quantity
clearCart()         // Clear cart

// Utilities
getCartItemCount()  // Total items
getCheckoutUrl()    // Shopify checkout URL
redirectToCheckout() // Redirect to checkout

// Sync
syncCartWithShopify()  // Sync on app init
```

---

## Environment Variables

```bash
# Required for MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=carlophillips

# Application
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Shopify (optional - enables live data)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_token

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
```

---

## Status

### Completed ✓
- Premium Vollebak-style UI
- Video hero section
- Product carousels
- Split-screen product pages
- Cart sidebar with animations
- Full-screen navigation
- Mock data system
- Shopify client with retry/fallback
- Cart with Shopify sync support
- Environment configuration

### Using Mock Data
Products are currently **MOCKED** for development. Add Shopify credentials to `.env` to switch to live data.

### Next Steps
1. Create Shopify store
2. Add products (map handles to mock data)
3. Add credentials to `.env`
4. Test checkout flow
