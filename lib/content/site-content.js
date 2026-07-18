const siteContent = {
  site: {
    name: 'CARLOPHILLIPS',
    tagline: 'Gesture of Luxury',
    description: 'A premium editorial brand system preparing its first approved release.',
    social: {
      instagram: 'https://instagram.com/carlophillips',
      tiktok: 'https://tiktok.com/@carlophillips',
      pinterest: 'https://pinterest.com/carlophillips',
    },
    banner: null,
    currency: {
      code: 'USD',
      symbol: '$',
    },
  },
  homepage: {
    hero: {
      eyebrow: 'Collection in preparation',
      headline: 'Gesture of\nLuxury',
      description: 'An editorial product system for premium essentials, graphic restraint, and future-ready apparel.',
      cta: {
        text: 'Preview the first drop',
        link: '/shop',
      },
      video: null,
    },
    brandStatement: {
      eyebrow: 'Editorial manifesto',
      headline: 'Not merch. A product language.',
      description: 'Built around restraint, proportion, and material presence.',
      cta: {
        text: 'Enter the studio',
        link: '/about',
      },
    },
    press: [],
    featuredSections: {
      carousels: [],
    },
  },
  collections: {
    allProducts: {
      title: 'The first drop is being prepared.',
      description: 'Products will appear after media, pricing, and fulfillment approval.',
    },
    overrides: {},
  },
  about: {
    hero: {
      title: 'CARLOPHILLIPS is being composed.',
      image: null,
    },
    story: {
      headline: 'A working studio for future releases.',
      paragraphs: [
        'Nothing enters the store until the object, media, pricing, and release state are approved.',
      ],
    },
    values: [
      {
        title: 'Restraint',
        description: 'Design decisions are made before public release.',
      },
      {
        title: 'Proportion',
        description: 'Scale, fit, and placement are treated as product decisions.',
      },
      {
        title: 'Presence',
        description: 'The public storefront should stay quiet until the work is ready.',
      },
    ],
  },
  lookbook: {
    title: 'Studio Notes',
    subtitle: 'In preparation',
    images: [],
  },
  product: {
    labels: {
      color: 'Color',
      size: 'Size',
      details: 'Details',
      addToBag: 'Add to Bag',
      addedToBag: 'Added to Bag',
    },
    shopifyIndicator: {
      connected: null,
      disconnected: null,
    },
  },
  cart: {
    title: 'Your Bag',
    emptyMessage: 'Your bag is empty',
    continueShopping: 'Return home',
    subtotal: 'Subtotal',
    shippingNote: 'Shipping and taxes are calculated at checkout.',
    checkoutButton: 'Checkout',
    status: {
      shopifyConnected: null,
      unavailable: null,
    },
  },
  footer: {
    description: 'A premium editorial brand system preparing its first approved release.',
    navigation: {
      shop: {
        title: 'Shop',
        links: [
          { label: 'First Drop', href: '/shop' },
          { label: 'Collections', href: '/collections' },
        ],
      },
      company: {
        title: 'Studio',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: 'mailto:hello@carlophillips.com' },
        ],
      },
    },
    legal: [],
    copyright: 'CARLOPHILLIPS',
  },
  navigation: {
    menu: [
      { id: 'home', label: 'Home' },
      { id: 'shop', label: 'First Drop' },
      { id: 'collections', label: 'Collections' },
      { id: 'about', label: 'Studio' },
    ],
    actions: {
      menu: 'Menu',
      close: 'Close',
      bag: 'Bag',
    },
  },
};

export default siteContent;

export const { site, homepage, collections, about, lookbook, product, cart, footer, navigation } = siteContent;
