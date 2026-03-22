// Premium product data with Vollebak-style storytelling
// Categories aligned with Printify print-on-demand offerings

export const collections = [
  {
    id: 'essentials',
    name: 'Essentials',
    description: 'Timeless basics engineered for everyday elegance. Premium organic materials, minimal design.',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80',
    featured: true,
  },
  {
    id: 'outerwear',
    name: 'Outerwear',
    description: 'Statement pieces built to last. Weather-resistant, sustainably crafted, impossibly comfortable.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80',
    featured: true,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'The finishing touches. Refined details that complete every look with quiet confidence.',
    image: 'https://images.unsplash.com/photo-1614179689741-0ebd3f0ff34b?w=1200&q=80',
    featured: true,
  },
  {
    id: 'home',
    name: 'Home & Living',
    description: 'Curated pieces for mindful living spaces. Luxury you can feel, sustainability you can trust.',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200&q=80',
    featured: true,
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    description: 'Minimalist adornments with quiet luxury. Timeless pieces designed to be worn forever.',
    image: 'https://images.unsplash.com/photo-1709600677254-0e961c8ed94e?w=1200&q=80',
    featured: false,
  },
];

export const products = [
  // ESSENTIALS - Premium Basics
  {
    id: 'essential-tee-black',
    name: 'The Essential Tee',
    collection: 'essentials',
    price: 68,
    tagline: 'BUILT WITH 100% ORGANIC COTTON. DESIGNED TO OUTLAST YOUR ENTIRE WARDROBE.',
    description: 'Our signature essential tee is crafted from premium organic cotton with a relaxed silhouette. Pre-washed for softness, pre-shrunk for the perfect fit. The foundation piece every wardrobe deserves.',
    details: ['100% organic Supima cotton', 'Pre-washed & pre-shrunk', 'Relaxed fit', 'Made in Portugal', 'Weight: 180gsm'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80',
    variants: {
      colors: ['Black', 'White', 'Stone'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Unisex T-Shirt',
  },
  {
    id: 'oversized-hoodie',
    name: 'The Oversized Hoodie',
    collection: 'essentials',
    price: 128,
    tagline: 'FRENCH TERRY COTTON. 400GSM HEAVYWEIGHT. THE ONLY HOODIE YOU\'LL EVER NEED.',
    description: 'Luxuriously soft oversized hoodie with dropped shoulders and minimalist design. Made from heavyweight French terry cotton that gets softer with every wash. This is elevated comfort for the discerning individual.',
    details: ['100% French terry cotton', '400gsm heavyweight', 'Oversized fit', 'Kangaroo pocket', 'Ribbed cuffs & hem'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&q=80',
    variants: {
      colors: ['Charcoal', 'Cream', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Pullover Hoodie',
  },
  {
    id: 'crewneck-sweatshirt',
    name: 'The Classic Crewneck',
    collection: 'essentials',
    price: 98,
    tagline: 'HEAVYWEIGHT CONSTRUCTION. BRUSHED INTERIOR. BUILT TO LAST DECADES.',
    description: 'A refined take on the classic crewneck sweatshirt. Clean lines and premium weight fabric with a brushed interior that feels like a warm embrace. Reinforced seams mean this piece will last.',
    details: ['80% cotton, 20% polyester', '350gsm heavyweight', 'Regular fit', 'Brushed fleece interior', 'Reinforced seams'],
    images: [
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=1200&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80',
    ],
    variants: {
      colors: ['Heather Grey', 'Black', 'Ecru'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Crewneck Sweatshirt',
  },

  // OUTERWEAR - Statement Pieces
  {
    id: 'bomber-jacket',
    name: 'The Bomber Jacket',
    collection: 'outerwear',
    price: 248,
    tagline: 'WATER-RESISTANT SHELL. QUILTED LINING. YKK ZIPPERS. THE MODERN CLASSIC.',
    description: 'Modern interpretation of the classic bomber. Water-resistant exterior with quilted lining for warmth without bulk. YKK zippers ensure durability. This is the jacket that goes everywhere.',
    details: ['Water-resistant nylon shell', 'Quilted polyester lining', 'YKK zippers', 'Ribbed collar, cuffs & hem', 'Internal pocket'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600&q=80',
    variants: {
      colors: ['Black', 'Olive', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Bomber Jacket',
  },
  {
    id: 'windbreaker',
    name: 'The Technical Windbreaker',
    collection: 'outerwear',
    price: 198,
    tagline: 'RIPSTOP NYLON. PACKABLE DESIGN. READY FOR ANYTHING.',
    description: 'Lightweight technical windbreaker with concealed hood. Packs into its own pocket. Ripstop nylon means it won\'t tear when you need it most. Perfect for transitional weather and spontaneous adventures.',
    details: ['Ripstop nylon construction', 'Packable design', 'Concealed hood', 'Adjustable hem', 'Weight: 200g'],
    images: [
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=1200&q=80',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=1200&q=80',
    ],
    variants: {
      colors: ['Stone', 'Black', 'Forest'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Windbreaker',
  },

  // ACCESSORIES - The Details
  {
    id: 'canvas-tote',
    name: 'The Canvas Tote',
    collection: 'accessories',
    price: 58,
    tagline: 'HEAVYWEIGHT CANVAS. REINFORCED HANDLES. CARRIES EVERYTHING.',
    description: 'Oversized canvas tote with reinforced handles. Made from heavyweight organic canvas that develops character over time. Interior pocket keeps essentials organized. Carries everything with understated elegance.',
    details: ['16oz heavyweight organic canvas', 'Reinforced handles', 'Interior pocket', 'Natural canvas base', 'Dimensions: 16" x 14" x 6"'],
    images: [
      'https://images.unsplash.com/photo-1614179689741-0ebd3f0ff34b?w=1200&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1614179689741-0ebd3f0ff34b?w=1600&q=80',
    variants: {
      colors: ['Natural', 'Black'],
      sizes: ['One Size'],
    },
    printifyCategory: 'Canvas Tote Bag',
  },
  {
    id: 'structured-cap',
    name: 'The Structured Cap',
    collection: 'accessories',
    price: 48,
    tagline: 'COTTON TWILL. TONAL EMBROIDERY. THE FINISHING TOUCH.',
    description: 'Minimalist structured cap with tonal embroidery. Made from premium cotton twill with an adjustable leather strap. Pre-curved brim for instant comfort. The finishing touch for any outfit.',
    details: ['100% cotton twill', 'Adjustable leather strap', 'Tonal embroidery', 'Pre-curved brim', 'Brass hardware'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1200&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200&q=80',
    ],
    variants: {
      colors: ['Black', 'White', 'Khaki'],
      sizes: ['One Size'],
    },
    printifyCategory: 'Dad Hat',
  },

  // HOME & LIVING - Luxury Spaces
  {
    id: 'throw-blanket',
    name: 'The Signature Throw',
    collection: 'home',
    price: 128,
    tagline: 'WOVEN COTTON BLEND. FRINGED EDGES. COZY SOPHISTICATION.',
    description: 'Plush woven throw blanket with subtle monogram and fringed edges. Made from a soft cotton blend that gets better with age. Machine washable for easy care. Cozy sophistication for any space.',
    details: ['60% cotton, 40% acrylic', 'Woven construction', 'Fringed edges', 'Machine washable', 'Dimensions: 50" x 60"'],
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1600&q=80',
    variants: {
      colors: ['Ivory', 'Grey', 'Black'],
      sizes: ['50x60'],
    },
    printifyCategory: 'Woven Blanket',
  },
  {
    id: 'accent-pillow',
    name: 'The Accent Pillow',
    collection: 'home',
    price: 68,
    tagline: 'VELVET COVER. HIDDEN ZIPPER. SUBTLE LUXURY.',
    description: 'Velvet accent pillow with hidden zipper and premium polyester fill. Double-sided print for versatility. Subtle luxury for your living space. The kind of detail that elevates everything around it.',
    details: ['Velvet cover', 'Premium polyester fill', 'Hidden zipper closure', 'Double-sided print', 'Spot clean only'],
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1200&q=80',
      'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=1200&q=80',
    ],
    variants: {
      colors: ['Charcoal', 'Cream', 'Blush'],
      sizes: ['18x18', '20x20'],
    },
    printifyCategory: 'Pillow',
  },
  {
    id: 'ceramic-mug',
    name: 'The Ceramic Mug',
    collection: 'home',
    price: 32,
    tagline: 'MATTE FINISH. PREMIUM CERAMIC. START EACH DAY WITH INTENTION.',
    description: 'Minimalist ceramic mug with matte finish. Premium construction that retains heat beautifully. Microwave and dishwasher safe for everyday use. Start each day with intention.',
    details: ['Premium ceramic', 'Matte finish', 'Microwave safe', 'Dishwasher safe', 'Capacity: 11oz / 15oz'],
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1200&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=1200&q=80',
    ],
    variants: {
      colors: ['White', 'Black'],
      sizes: ['11oz', '15oz'],
    },
    printifyCategory: 'Ceramic Mug',
  },

  // JEWELRY - Quiet Luxury
  {
    id: 'minimal-pendant',
    name: 'The Minimal Pendant',
    collection: 'jewelry',
    price: 88,
    tagline: '18K GOLD VERMEIL. HYPOALLERGENIC. QUIET LUXURY.',
    description: 'Delicate pendant necklace with geometric charm. 18k gold vermeil over sterling silver ensures lasting beauty. Hypoallergenic and tarnish-resistant. Quiet luxury that speaks volumes.',
    details: ['18k gold vermeil', 'Sterling silver base', 'Hypoallergenic', 'Tarnish-resistant', 'Lobster clasp closure'],
    images: [
      'https://images.unsplash.com/photo-1709600677254-0e961c8ed94e?w=1200&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1709600677254-0e961c8ed94e?w=1600&q=80',
    variants: {
      colors: ['Gold', 'Silver'],
      sizes: ['18"', '20"'],
    },
    dropshipSource: 'CJ Dropshipping',
  },
  {
    id: 'signet-ring',
    name: 'The Signet Ring',
    collection: 'jewelry',
    price: 118,
    tagline: 'STERLING SILVER. BRUSHED FINISH. A TIMELESS STATEMENT.',
    description: 'Modern signet ring with brushed finish. Sterling silver construction with comfort fit band. Unisex design that works with any style. A timeless statement piece.',
    details: ['925 sterling silver', 'Brushed finish', 'Comfort fit band', 'Unisex design', 'Engraving available'],
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1200&q=80',
    ],
    variants: {
      colors: ['Silver', 'Gold'],
      sizes: ['6', '7', '8', '9', '10'],
    },
    dropshipSource: 'CJ Dropshipping',
  },
];

export function getProduct(id) {
  return products.find(p => p.id === id);
}

export function getProductsByCollection(collectionId) {
  return products.filter(p => p.collection === collectionId);
}

export function getCollection(id) {
  return collections.find(c => c.id === id);
}

export function getFeaturedProducts(limit = 4) {
  return products.slice(0, limit);
}

export function getFeaturedCollections() {
  return collections.filter(c => c.featured);
}
