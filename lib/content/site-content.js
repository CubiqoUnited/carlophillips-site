/**
 * CARLOPHILLIPS - SITE CONTENT CONFIGURATION
 * 
 * This file contains all editorial content for the website.
 * Update text, images, and messaging here without touching component code.
 * 
 * Structure:
 * - site: Global site settings (name, tagline, social links)
 * - homepage: Hero, featured sections, brand story
 * - collections: Collection page headers and descriptions
 * - about: About page content
 * - lookbook: Lookbook page content
 * - footer: Footer content and links
 */

const siteContent = {
  // ============================================
  // GLOBAL SITE SETTINGS
  // ============================================
  site: {
    name: 'CARLOPHILLIPS',
    tagline: 'Geometric Luxury',
    description: 'A modern menswear identity built from clean geometry, quiet luxury, and precise everyday pieces.',
    
    // Social links
    social: {
      instagram: 'https://instagram.com/carlophillips',
      tiktok: 'https://tiktok.com/@carlophillips',
      pinterest: 'https://pinterest.com/carlophillips',
    },
    
    // Promotional banner (set to null to hide)
    banner: {
      text: 'QA preview: first product staged for review',
      link: null,
    },
    
    // Currency settings
    currency: {
      code: 'USD',
      symbol: '$',
    },
  },

  // ============================================
  // HOMEPAGE CONTENT
  // ============================================
  homepage: {
    // Hero section
    hero: {
      eyebrow: '2026 Common Era',
      headline: 'Geometric\nLuxury',
      description: 'CARLOPHILLIPS moves into a sharper identity: graphite, off-white, deep navy, controlled red, and clothes built from decisive forms.',
      cta: {
        text: 'Shop Now',
        link: '/collections',
      },
      // Video URL (replace with your brand video)
      video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    },

    // Brand statement section
    brandStatement: {
      eyebrow: 'Brand Revision',
      headline: 'The new CARLOPHILLIPS language is geometric, restrained, and ready for product.',
      description: 'Logo marks, garment graphics, labels, and Shopify product data now share one system: precise shapes, quiet contrast, premium neutrals, and a measured red accent used only where it adds intent.',
      cta: {
        text: 'Learn More',
        link: '/about',
      },
    },

    // Press/media mentions
    press: [
      { name: 'VOGUE', quote: '"Understated luxury at its finest"' },
      { name: 'GQ', quote: '"The future of sustainable fashion"' },
      { name: 'HYPEBEAST', quote: '"Minimal, intentional, perfect"' },
      { name: 'HIGHSNOBIETY', quote: '"Quality that speaks for itself"' },
    ],

    // Featured sections configuration
    featuredSections: {
      // First product hero
      productHero1: {
        productId: 'carlo-houndstooth-runway-polo',
        fallbackIndex: 0,
      },
      // Second product hero
      productHero2: {
        productId: 'oversized-hoodie',
        fallbackIndex: 1,
        reverse: true,
      },
      // Featured collection showcase
      collectionShowcase: {
        collectionId: 'essentials',
      },
      // Product carousels
      carousels: [
        {
          title: 'Featured Products',
          type: 'featured',
          limit: 8,
        },
        {
          title: 'New Arrivals',
          type: 'slice',
          start: 4,
          end: 12,
        },
      ],
    },
  },

  // ============================================
  // COLLECTIONS PAGE CONTENT
  // ============================================
  collections: {
    // Default header for "All Products"
    allProducts: {
      title: 'All Products',
      description: 'Explore our complete collection of luxury essentials',
    },
    
    // Override descriptions for specific collections
    // (these supplement Shopify collection data)
    overrides: {
      essentials: {
        headline: 'The foundation of your wardrobe',
      },
      outerwear: {
        headline: 'Statement pieces for every season',
      },
      accessories: {
        headline: 'The finishing touches',
      },
      jewelry: {
        headline: 'Masculine minimalism',
      },
      home: {
        headline: 'Curated for mindful living',
      },
    },
  },

  // ============================================
  // ABOUT PAGE CONTENT
  // ============================================
  about: {
    // Hero section
    hero: {
      title: 'About Us',
      image: 'https://images.unsplash.com/photo-1698306871917-7b91b07a0bb4?w=1600&q=80',
    },

    // Story section
    story: {
      headline: 'Carlophillips was founded on a simple principle: that luxury should be accessible, sustainable, and timeless.',
      paragraphs: [
        'We reject the notion that quality must come at the expense of our values. Every piece in our collection is designed with intention, using premium materials sourced from ethical suppliers.',
        'We work with print-on-demand and dropshipping partners who share our commitment to reducing waste and environmental impact. Our goal is to create pieces that you\'ll cherish for years—not seasons.',
      ],
    },

    // Values section
    values: [
      {
        title: 'Sustainability',
        description: 'We produce only what is ordered, eliminating overproduction.',
      },
      {
        title: 'Quality',
        description: 'Premium materials and expert craftsmanship in every piece.',
      },
      {
        title: 'Timelessness',
        description: 'Designs meant to last—both in construction and style.',
      },
    ],
  },

  // ============================================
  // LOOKBOOK PAGE CONTENT
  // ============================================
  lookbook: {
    title: 'Lookbook',
    subtitle: 'Summer 2025',
    
    // Editorial images
    images: [
      'https://images.unsplash.com/photo-1698306871917-7b91b07a0bb4?w=1200&q=80',
      'https://images.unsplash.com/photo-1614179689741-0ebd3f0ff34b?w=1200&q=80',
      'https://images.pexels.com/photos/6070179/pexels-photo-6070179.jpeg?w=1200',
      'https://images.unsplash.com/photo-1709600677254-0e961c8ed94e?w=1200&q=80',
      'https://images.unsplash.com/photo-1550029402-8280f657d8d1?w=1200&q=80',
      'https://images.pexels.com/photos/2986445/pexels-photo-2986445.jpeg?w=1200',
    ],
  },

  // ============================================
  // PRODUCT PAGE CONTENT
  // ============================================
  product: {
    // Labels
    labels: {
      color: 'Color',
      size: 'Size',
      details: 'Details',
      addToBag: 'Add to Bag',
      addedToBag: 'Added to Bag',
    },
    
    // Shopify connection indicator
    shopifyIndicator: {
      connected: '● Live Shopify Data',
      disconnected: null, // Don't show when disconnected
    },
  },

  // ============================================
  // CART CONTENT
  // ============================================
  cart: {
    title: 'Your Bag',
    emptyMessage: 'Your bag is empty',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    shippingNote: 'Shipping & taxes calculated at checkout',
    checkoutButton: 'Checkout',
    
    // Status messages
    status: {
      shopifyConnected: '● Secure checkout powered by Shopify',
      demoMode: '● Demo mode - Connect Shopify for checkout',
    },
  },

  // ============================================
  // FOOTER CONTENT
  // ============================================
  footer: {
    // Brand description
    description: 'A modern luxury lifestyle brand. Premium clothing, jewelry, accessories, and home items designed for those who appreciate understated elegance.',
    
    // Footer navigation
    navigation: {
      shop: {
        title: 'Shop',
        links: [
          { label: 'All Products', href: '/collections' },
          { label: 'Essentials', href: '/collections/essentials' },
          { label: 'Outerwear', href: '/collections/outerwear' },
          { label: 'Accessories', href: '/collections/accessories' },
          { label: 'Home & Living', href: '/collections/home' },
        ],
      },
      company: {
        title: 'Company',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Sustainability', href: '/about#sustainability' },
          { label: 'Shipping & Returns', href: '/shipping' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    },
    
    // Legal links
    legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
    ],
    
    // Copyright
    copyright: '© 2025 Carlophillips. All rights reserved.',
  },

  // ============================================
  // NAVIGATION CONTENT
  // ============================================
  navigation: {
    // Main menu items
    menu: [
      { id: 'home', label: 'Home' },
      { id: 'collections', label: 'Shop All' },
      { id: 'essentials', label: 'Essentials', collection: true },
      { id: 'outerwear', label: 'Outerwear', collection: true },
      { id: 'jewelry', label: 'Jewelry & Watches', collection: true },
      { id: 'accessories', label: 'Accessories', collection: true },
      { id: 'home-collection', label: 'Home & Living', collection: true },
      { id: 'about', label: 'About' },
      { id: 'lookbook', label: 'Lookbook' },
    ],
    
    // Header actions
    actions: {
      menu: 'Menu',
      close: 'Close',
      bag: 'Bag',
    },
  },
};

export default siteContent;

// Export individual sections for convenience
export const { site, homepage, collections, about, lookbook, product, cart, footer, navigation } = siteContent;
