# Carlophillips - Production-Ready Headless Storefront

## Project Overview
Premium luxury ecommerce website for Carlophillips - a modern **male-dominant, unisex, metrosexual** lifestyle brand selling clothing, jewelry & watches, accessories, and home items using a print-on-demand and dropshipping model.

**Brand Identity:** Sophisticated masculine minimalism. Designed for the modern man who values quality, understated elegance, and timeless design.

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes, MongoDB
- **Commerce:** Shopify Storefront API (headless)
- **Design:** Vollebak-inspired premium aesthetic

---

## Folder Structure

```
/app
├── app/
│   ├── page.js                    # Main app with all components
│   ├── layout.js                  # Root layout
│   ├── globals.css                # Global styles
│   └── api/[[...path]]/route.js   # Backend API routes
├── lib/
│   ├── config/
│   │   └── shopify.js             # Shopify configuration
│   ├── shopify/
│   │   ├── index.js               # Shopify exports
│   │   ├── client.js              # Storefront API client
│   │   ├── types.js               # Type definitions & fragments
│   │   ├── queries.js             # GraphQL queries
│   │   └── mutations.js           # Cart mutations
│   ├── data/
│   │   ├── products.js            # Data service layer
│   │   └── mock-data.js           # Fallback mock data
│   └── store/
│       └── cart.js                # Cart management
├── components/
│   └── ui/                        # shadcn components
├── .env                           # Environment variables
└── memory/
    └── PRD.md                     # This file
```

---

## Shopify Integration

### Configuration
Add to `.env`:
```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_storefront_access_token
```

### Automatic Fallback
The app automatically:
1. Checks if Shopify credentials are configured
2. Falls back to mock data if not configured
3. Logs warnings when Shopify requests fail

### Cart Flow
1. **Local Mode:** Cart stored in localStorage
2. **Shopify Mode:** 
   - Creates Shopify Cart via API
   - Syncs items with Shopify
   - Checkout redirects to Shopify's hosted checkout

---

## Data Layer

### Products Service (`lib/data/products.js`)
```javascript
// Async methods (use with Shopify)
getProducts()
getProductAsync(id)
getProductsByCollectionAsync(collectionId)
searchProducts(query)

// Sync methods (use with mock data)
getProductsSync()
getProduct(id)
getProductsByCollection(collectionId)
getFeaturedProducts(limit)
getCollection(id)
getFeaturedCollections()
```

### Cart Service (`lib/store/cart.js`)
```javascript
getCart()
addToCart(product, color, size, quantity)
removeFromCart(itemKey)
updateQuantity(itemKey, quantity)
clearCart()
getCartItemCount()
getCheckoutUrl()
syncCartWithShopify()
```

---

## Product Collections

### Male/Metrosexual Focus
1. **Essentials** - Premium tees, hoodies, crewnecks, joggers
2. **Outerwear** - Bomber jackets, overshirts, quilted vests
3. **Accessories** - Leather backpack, cardholder, belt, cap
4. **Jewelry & Watches** - Cuban chains, signet rings, cuff bracelets, field watches
5. **Home & Living** - Wool throws, ceramic mugs, scented candles

### Product Categories (Printify/CJ Compatible)
- **Printify:** T-shirts, hoodies, sweatshirts, joggers, jackets
- **CJ Dropshipping:** Jewelry, watches, leather goods

---

## API Endpoints

### Health & Products
- `GET /api/health` - API health check
- `GET /api/products` - All products
- `GET /api/products/:id` - Single product
- `GET /api/collections` - All collections
- `GET /api/collections/:id` - Collection with products

### Cart
- `GET /api/cart/:sessionId` - Get cart
- `POST /api/cart/add` - Add item
- `POST /api/cart/update` - Update quantity
- `POST /api/cart/remove` - Remove item
- `DELETE /api/cart/:sessionId` - Clear cart

### Newsletter
- `POST /api/newsletter` - Subscribe

---

## Key Features

### UI/UX (Vollebak-Inspired)
- ✅ Full-bleed hero sections with video
- ✅ Full-screen navigation menu
- ✅ Horizontal product carousels with counter
- ✅ Split-screen product pages
- ✅ Premium cart sidebar
- ✅ Smooth Framer Motion animations
- ✅ Dark theme throughout

### Commerce
- ✅ Product browsing by collection
- ✅ Variant selection (color/size)
- ✅ Add to cart functionality
- ✅ Cart quantity management
- ✅ Checkout redirect ready

### Architecture
- ✅ Clean folder structure
- ✅ Shopify integration scaffold
- ✅ Type definitions (JSDoc)
- ✅ Mock data fallback
- ✅ Environment variable config

---

## Next Steps

### To Go Live with Shopify:
1. Create Shopify store and add products
2. Create a private app with Storefront API access
3. Add credentials to `.env`
4. Map product handles between Shopify and frontend

### Future Enhancements:
- [ ] Product search functionality
- [ ] Wishlist / saved items
- [ ] User accounts (Shopify Customer API)
- [ ] Product filtering (price, size, color)
- [ ] Related products
- [ ] Reviews (Judge.me integration)
- [ ] Email marketing (Klaviyo)
- [ ] Analytics (GA, Meta Pixel)

---

## Mock Data Note
Currently using **MOCK** data for products. The UI is fully functional and ready for Shopify integration. When Shopify credentials are added, the app will automatically switch to live data.
