# Carlophillips - Luxury Ecommerce Website PRD

## Project Overview
Premium luxury ecommerce website for Carlophillips - a modern lifestyle brand selling clothing, jewelry, accessories, and home items using a print-on-demand and dropshipping model.

## Design Philosophy
- **Visual Style**: Minimal luxury fashion brand (similar to Zara, Vollebak, COS)
- **Color Palette**: Black / White / Neutral
- **Typography**: Cormorant Garamond (headings) + Inter (body)
- **Experience**: Cinematic, premium browsing with smooth animations

## Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Implemented Features

### Phase 1 (MVP) - COMPLETE ✓
1. **Homepage**
   - Video hero section (placeholder video, user can replace)
   - Featured collections grid
   - Featured products section
   - Brand storytelling section
   - Footer with links

2. **Collections Page**
   - Product grid with all products
   - Category filter buttons
   - Hover effects and quick view

3. **Product Page**
   - Large product gallery
   - Product description
   - Variant selection (color/size)
   - Add to cart functionality

4. **Cart System**
   - Cart sidebar with slide animation
   - Item quantity controls (+/-)
   - Remove items
   - Subtotal calculation
   - Checkout button (placeholder)

5. **Navigation**
   - Fixed header with scroll effect
   - Full-screen menu overlay
   - Cart icon with item count
   - Smooth animations

6. **Editorial Pages**
   - About page with brand story
   - Lookbook page with editorial images

## Product Categories (Printify-Compatible)
1. **Essentials** - T-shirts, hoodies, sweatshirts
2. **Outerwear** - Bomber jackets, windbreakers
3. **Accessories** - Canvas totes, structured caps
4. **Home & Living** - Throw blankets, accent pillows, ceramic mugs
5. **Jewelry** - Minimal pendants, signet rings (CJ Dropshipping)

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/collections` - Get all collections
- `GET /api/collections/:id` - Get collection with products
- `GET /api/cart/:sessionId` - Get cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/update` - Update quantity
- `POST /api/cart/remove` - Remove item
- `DELETE /api/cart/:sessionId` - Clear cart
- `POST /api/newsletter` - Subscribe to newsletter

## Future Phases (Not Implemented)
- Shopify Storefront API integration
- Real checkout flow (redirect to Shopify)
- User authentication
- Wishlist functionality
- Search functionality
- Product filters (price, size, color)
- Reviews integration (Judge.me)
- Email marketing (Klaviyo)
- Analytics (GA, Meta Pixel, TikTok Pixel)

## Data Model

### Product
```javascript
{
  id: string,
  name: string,
  collection: string,
  price: number,
  description: string,
  details: string[],
  images: string[],
  variants: {
    colors: string[],
    sizes: string[]
  }
}
```

### Cart Item
```javascript
{
  key: string, // productId-color-size
  productId: string,
  name: string,
  price: number,
  image: string,
  color: string,
  size: string,
  quantity: number
}
```

## Notes
- Currently using MOCK data for products (no Shopify integration yet)
- Cart data persists in localStorage and MongoDB
- Video hero uses placeholder video - user should replace with brand video
- Checkout button is placeholder - will redirect to Shopify when integrated
