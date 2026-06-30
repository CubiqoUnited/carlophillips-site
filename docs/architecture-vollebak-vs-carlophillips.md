# CARLOPHILLIPS vs Vollebak Architecture

## What Vollebak Appears To Have

```mermaid
flowchart LR
  Visitor[Customer Browser] --> ShopifyTheme[Shopify Online Store 2.0 Theme]
  ShopifyTheme --> ShopifyCDN[Shopify CDN Theme Assets]
  ShopifyTheme --> Sections[Reusable Shopify Sections]
  ShopifyTheme --> PDP[Product Detail Pages]
  ShopifyTheme --> PLP[Collection / Product Grid]
  PDP --> ProductMedia[Shopify Product Media]
  ProductMedia --> Images[High-res Images]
  ProductMedia --> Video[Product / Editorial Video]
  ProductMedia --> Motion[Animation + Interaction Layer]
  ShopifyTheme --> Cart[Shopify Cart]
  Cart --> Checkout[Shopify Checkout]
  ShopifyTheme --> Markets[Shopify Markets / Multi-currency]
  ShopifyTheme --> Email[Klaviyo]
  ShopifyTheme --> Consent[OneTrust]
  ShopifyTheme --> Support[Zendesk]
  ShopifyTheme --> Analytics[Hotjar / Shopify Analytics]
  ShopifyAdmin[Shopify Admin] --> Sections
  ShopifyAdmin --> ProductMedia
  ShopifyAdmin --> Markets
```

### Read

Vollebak is not winning because Shopify alone makes things premium. They have a Shopify Plus / Online Store 2.0 theme architecture, reusable page sections, strong product media, animation, interaction, and content-heavy storytelling built into their storefront.

## What CARLOPHILLIPS Has Now

```mermaid
flowchart LR
  Visitor[Customer Browser] --> Vercel[Vercel / Next.js Frontend]
  Vercel --> NextUI[Custom React Product UI]
  NextUI --> ShopifyStorefront[Shopify Storefront API]
  ShopifyStorefront --> Products[12 Shopify Products]
  Products --> CurrentMedia[Current Shopify Media]
  CurrentMedia --> ImagesOnly[2 Images / Product Only]
  NextUI --> RichRenderer[New Rich Media Renderer]
  RichRenderer --> SupportsImages[Images]
  RichRenderer --> SupportsVideo[Video Ready]
  RichRenderer --> Supports3D[3D Model Ready]
  RichRenderer --> SupportsExternalVideo[YouTube / Vimeo Ready]
  NextUI --> Cart[Shopify Cart API]
  Cart --> Checkout[Shopify Checkout]
  ShopifyAdmin[Shopify Admin] --> Products
  ShopifyAdmin --> Orders[Orders]
  ShopifyAdmin --> Apps[Apps / Sales Channels]
```

### Read

CARLOPHILLIPS is structurally capable now, but media-poor. The frontend can render Shopify video and 3D media, but Shopify currently returns only IMAGE media for all 12 products.

## Gap

```mermaid
flowchart TD
  Goal[Vollebak-level premium feel] --> NeedsA[Premium product media in Shopify]
  Goal --> NeedsB[Reusable editorial sections]
  Goal --> NeedsC[Motion-first PDP / PLP]
  Goal --> NeedsD[Trust + fulfillment readiness]

  NeedsA --> MissingA[Missing now: video / 3D / 360 assets]
  NeedsB --> PartialB[Partial now: custom Next sections exist]
  NeedsC --> PartialC[Partial now: renderer supports rich media]
  NeedsD --> NeedsAudit[Needs app/order/fulfillment audit]
```

## Recommended Path

1. Keep Shopify as product, order, app, checkout, payment, and fulfillment backend.
2. Keep Next.js for SEO/frontend, but only if it renders Shopify-native product media and content.
3. Add rich media into Shopify product records:
   - product video
   - 360 spin
   - GLB/USDZ 3D models where practical
   - high-resolution editorial/lifestyle media
4. Use Shopify apps only where they write back to Shopify media, metafields, product pages, or app blocks.
5. Avoid custom one-off visual hacks that live outside the product record.

## Immediate App Candidates

- Cappasity: 3D/360 product viewer and AR-style product experience.
- Zakeke / Angle 3D: 3D product configurator and product model workflows.
- Spin Studio: 360 spin style product viewing.
- Shopify Search & Discovery: native merchandising and filtering.
- Shopify Bundles: native bundles.
- Klaviyo: lifecycle and abandoned checkout email.
- Loox or Judge.me: reviews with photo/social proof.

## Current Production Evidence

Production Shopify media audit:

```json
{
  "shopify": "Connected",
  "productCount": 12,
  "mediaTypeCounts": { "IMAGE": 12 },
  "productsWithoutMotionOr3d": 12
}
```

Order visible in Shopify Admin:

```text
Order: #1001
Customer: james anderson
Channel: Online Store
Total: $47.07
Payment: Paid / Complete
Fulfillment: Unfulfilled
Items: 1
Delivery method: International
```

