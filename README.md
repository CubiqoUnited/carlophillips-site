# CARLOPHILLIPS - Premium Headless Ecommerce

A luxury headless ecommerce storefront built with Next.js and Shopify, featuring a multi-brand architecture and premium UI.

## 🌟 Features

- **Headless Architecture**: Next.js 14 frontend connected to Shopify Storefront API
- **Multi-Brand Support**: Three distinct brand identities (CARLOPHILLIPS, love,Carlo, HouseofCarlo)
- **Premium UI**: Cinematic design inspired by Vollebak, with animated hero sections
- **Shopify Integration**: Full cart and checkout functionality via Shopify
- **Print-on-Demand**: Connected to Printify for zero-inventory fulfillment
- **Mobile Optimized**: Responsive design with touch-friendly interactions

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Shopify Storefront GraphQL API
- **State Management**: Zustand (cart state)
- **Animation**: Framer Motion
- **Deployment**: Node.js standalone

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Shopify store with Storefront API credentials

### Installation

```bash
# Install dependencies
yarn install

# Create a local environment file, then add your Shopify credentials
# NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
# NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-token

# Run development server
yarn dev
```

Visit `http://localhost:3000`

## 📦 Environment Variables

### Required
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Your Shopify store domain
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` - Shopify Storefront API token
- `NEXT_PUBLIC_BASE_URL` - Your site URL

### Optional
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID
- `NEXT_PUBLIC_META_PIXEL_ID` - Facebook Pixel ID
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID` - TikTok Pixel ID

## 🏪 Shopify Setup

1. **Enable Storefront API:**
   - Go to Shopify Admin > Settings > Apps and sales channels
   - Create a custom app
   - Enable Storefront API with required scopes
   - Copy the Storefront access token

2. **Configure Printify:**
   - Install Printify app from Shopify App Store
   - Connect your print providers (Printful, Apliiq, etc.)
   - Publish products to your store
   - Enable auto-order approval

3. **Enable Payments:**
   - Go to Settings > Payments
   - Set up Shopify Payments or third-party processor
   - Enable test mode for testing

## 🌐 Deployment

### Staging: staging.carlophillips.com
```bash
# Build with staging environment variables
yarn build
yarn start
```

### Production: www.carlophillips.com
```bash
# Build with production environment variables
yarn build
yarn start
```

## 📁 Project Structure

```
/app
├── app/
│   ├── api/           # API routes (health check)
│   ├── globals.css    # Global styles
│   ├── layout.js      # Root layout
│   └── page.js        # Main storefront UI
├── lib/
│   ├── brands/        # Multi-brand configuration
│   ├── content/       # Site content and copy
│   ├── shopify/       # Shopify API client
│   └── store/         # State management (cart)
├── public/            # Static assets
└── next.config.js     # Next.js configuration
```

## 🎨 Brand Architecture

Three distinct brands share a unified cart:

1. **CARLOPHILLIPS** - Main luxury line (navy, grey, white, burgundy)
2. **love,Carlo** - Colorful lifestyle line (orange, red, blue)
3. **HouseofCarlo** - Home & living line (cream, charcoal, tan)

Switch brands via the top navigation or by accessing brand-specific domains.

## 🛒 Commerce Flow

1. User browses products (fetched from Shopify)
2. User adds items to cart (Zustand state + Shopify Cart API)
3. User clicks checkout → Redirect to Shopify Checkout
4. Shopify processes payment
5. Order sent to Printify for fulfillment
6. Customer receives tracking from Shopify

## 🔧 Development

### Key Commands
```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```

### Testing Cart Flow
```bash
# Generate a test checkout URL
node scripts/test-cart.js
```

## 📝 Content Management

All site content is managed in `/lib/content/site-content.js`:
- Hero sections
- Product copy
- Footer content
- Navigation items

Update content here without touching component code.

## 🔐 Security Notes

- Storefront API token is public-safe (read-only access)
- Never expose Admin API credentials in frontend code
- Environment variables are properly scoped
- CORS configured for your domains only

## 🐛 Troubleshooting

### Cart not working?
- Verify Shopify credentials in `.env`
- Check browser console for API errors
- Ensure products have valid variants

### Products not loading?
- Confirm products are published to "Headless" sales channel in Shopify
- Check Shopify API token permissions

### Checkout redirects failing?
- Verify `NEXT_PUBLIC_BASE_URL` matches your domain
- Check Shopify Payments is enabled

## 📧 Support

For issues or questions:
- Check `/memory/PRD.md` for product requirements
- Review Shopify Admin > Apps > Printify for order status
- Test cart flow with checkout URL generator script

## 📄 License

Private & Confidential - CARLOPHILLIPS Brand

---

Built with 🖤 for luxury ecommerce
