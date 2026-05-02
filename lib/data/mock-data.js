/**
 * MOCK DATA - Male/Metrosexual Focused Luxury Products
 * 
 * This data is used as a fallback when Shopify is not configured.
 * Products are aligned with Printify print-on-demand categories.
 * 
 * Brand Identity: Carlophillips - Male-dominant, unisex, metrosexual luxury brand
 * Target: Modern men who appreciate understated elegance and quality
 */

export const mockCollections = [
  {
    id: 'essentials',
    name: 'Essentials',
    description: 'Timeless basics engineered for the modern man. Premium organic materials, minimal design, maximum impact.',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200&q=80',
    featured: true,
  },
  {
    id: 'outerwear',
    name: 'Outerwear',
    description: 'Statement pieces built to last. Technical fabrics, clean lines, uncompromising quality.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80',
    featured: true,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'The finishing touches. Leather goods, bags, and refined details for the discerning gentleman.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80',
    featured: true,
  },
  {
    id: 'home',
    name: 'Home & Living',
    description: 'Curated pieces for your space. Luxury you can feel, sustainability you can trust.',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200&q=80',
    featured: true,
  },
  {
    id: 'jewelry',
    name: 'Jewelry & Watches',
    description: 'Masculine minimalism. Chains, rings, bracelets, and timepieces for the modern man.',
    image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=1200&q=80',
    featured: true,
  },
  {
    id: 'grooming',
    name: 'Grooming',
    description: 'Elevated self-care. Premium grooming essentials for the refined individual.',
    image: 'https://images.unsplash.com/photo-1581750216968-5a5dca94588e?w=1200&q=80',
    featured: false,
  },
];

export const mockProducts = [
  {
    id: 'cp-offshore-cpo-overshirt',
    name: 'CP Offshore CPO Overshirt',
    collection: 'outerwear',
    price: 188,
    tagline: 'APLIIQ QA SAMPLE. STRUCTURED OVERSHIRT. QUIET BLACK-AND-WHITE GEOMETRY.',
    description: 'A staged CARLOPHILLIPS CPO layer for Shopify and Apliiq QA review. The piece is positioned as a premium outerwear shirt: sharp enough over tailoring, easy enough over a knit, and built around the restrained CP geometric language.',
    details: [
      'Apliiq POD candidate for Shopify QA',
      'CPO overshirt silhouette with structured chest pockets',
      'Black body with controlled white geometric CP placement',
      'Premium menswear positioning for first product review',
      'Staged product data; supplier production settings still need final Apliiq confirmation',
    ],
    images: [
      '/products/first-review/carlo-houndstooth-runway-polo-hero.png',
      '/products/first-review/carlo-houndstooth-runway-polo-alt.png',
    ],
    heroImage: '/products/first-review/carlo-houndstooth-runway-polo-hero.png',
    variants: {
      colors: ['Black / White'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  },
  {
    id: 'carlo-houndstooth-runway-polo',
    name: 'CARLO Houndstooth Runway Polo',
    collection: 'essentials',
    price: 148,
    tagline: 'GEOMETRIC BLACK-AND-WHITE KNIT. RUNWAY CUT. THE FIRST CARLOPHILLIPS REVIEW PRODUCT.',
    description: 'A sharp short-sleeve polo built around the revised CARLO geometric identity. The oversized houndstooth field carries the brand language from logo system into garment: precise, masculine, graphic, and easy to style under a blazer or on its own.',
    details: [
      'Structured knit polo body',
      'Black sleeves, collar, and hem',
      'Oversized black-and-white geometric houndstooth chest panel',
      'Three-button placket',
      'Designed for Shopify QA owner review',
    ],
    images: [
      '/products/first-review/carlo-houndstooth-runway-polo-hero.png',
      '/products/first-review/carlo-houndstooth-runway-polo-alt.png',
    ],
    heroImage: '/products/first-review/carlo-houndstooth-runway-polo-hero.png',
    variants: {
      colors: ['Black / White'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  },
  // ============ ESSENTIALS ============
  {
    id: 'essential-tee-black',
    name: 'The Essential Tee',
    collection: 'essentials',
    price: 68,
    tagline: 'BUILT WITH 100% ORGANIC COTTON. DESIGNED TO OUTLAST YOUR ENTIRE WARDROBE.',
    description: 'Our signature essential tee is crafted from premium organic Supima cotton with a relaxed masculine silhouette. Pre-washed for softness, pre-shrunk for the perfect fit. The foundation piece every man deserves.',
    details: ['100% organic Supima cotton', 'Heavyweight 220gsm', 'Relaxed athletic fit', 'Reinforced collar', 'Made in Portugal'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80',
    variants: {
      colors: ['Black', 'White', 'Charcoal', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  },
  {
    id: 'oversized-hoodie',
    name: 'The Heavyweight Hoodie',
    collection: 'essentials',
    price: 148,
    tagline: 'FRENCH TERRY COTTON. 450GSM HEAVYWEIGHT. THE ONLY HOODIE YOU\'LL EVER NEED.',
    description: 'Heavyweight French terry hoodie with dropped shoulders and minimalist design. Made from 450gsm cotton that gets softer with every wash. Built for comfort without sacrificing style.',
    details: ['100% French terry cotton', '450gsm heavyweight', 'Dropped shoulders', 'Kangaroo pocket', 'YKK zippers'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&q=80',
    variants: {
      colors: ['Charcoal', 'Black', 'Navy', 'Olive'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  },
  {
    id: 'crewneck-sweatshirt',
    name: 'The Classic Crewneck',
    collection: 'essentials',
    price: 118,
    tagline: 'HEAVYWEIGHT CONSTRUCTION. BRUSHED INTERIOR. BUILT TO LAST DECADES.',
    description: 'A refined take on the classic crewneck sweatshirt. Clean lines and premium weight fabric with a brushed interior. Reinforced seams mean this piece will outlast trends.',
    details: ['80% cotton, 20% polyester', '400gsm heavyweight', 'Athletic fit', 'Brushed fleece interior', 'Reinforced seams'],
    images: [
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=1200&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80',
    ],
    variants: {
      colors: ['Heather Grey', 'Black', 'Navy', 'Forest'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  },
  {
    id: 'jogger-pants',
    name: 'The Technical Jogger',
    collection: 'essentials',
    price: 128,
    tagline: 'FOUR-WAY STRETCH. WATER-RESISTANT. FROM GYM TO STREET.',
    description: 'Technical joggers that blur the line between athletic and lifestyle wear. Four-way stretch fabric with water-resistant coating. Zippered pockets keep your essentials secure.',
    details: ['Nylon-spandex blend', 'Four-way stretch', 'Water-resistant DWR coating', 'Zippered pockets', 'Tapered fit'],
    images: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&q=80',
    ],
    variants: {
      colors: ['Black', 'Charcoal', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  },

  // ============ OUTERWEAR ============
  {
    id: 'bomber-jacket',
    name: 'The Bomber Jacket',
    collection: 'outerwear',
    price: 298,
    tagline: 'WATER-RESISTANT SHELL. QUILTED LINING. YKK ZIPPERS. THE MODERN CLASSIC.',
    description: 'Modern interpretation of the classic MA-1 bomber. Water-resistant nylon shell with quilted lining for warmth without bulk. Premium YKK zippers ensure durability for years.',
    details: ['Water-resistant nylon shell', 'Quilted polyester lining', 'YKK zippers', 'Ribbed collar, cuffs & hem', 'Interior pocket'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600&q=80',
    variants: {
      colors: ['Black', 'Olive', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  },
  {
    id: 'tech-overshirt',
    name: 'The Technical Overshirt',
    collection: 'outerwear',
    price: 198,
    tagline: 'RIPSTOP FABRIC. SNAP BUTTONS. THE PERFECT LAYERING PIECE.',
    description: 'Versatile overshirt in technical ripstop fabric. Works as a light jacket or heavy shirt. Snap button closure with chest pockets. The ultimate transitional piece.',
    details: ['Ripstop cotton blend', 'Snap button closure', 'Chest pockets with flaps', 'Adjustable cuffs', 'Regular fit'],
    images: [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=80',
    ],
    variants: {
      colors: ['Olive', 'Black', 'Navy', 'Stone'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  },
  {
    id: 'quilted-vest',
    name: 'The Quilted Vest',
    collection: 'outerwear',
    price: 178,
    tagline: 'LIGHTWEIGHT INSULATION. PACKABLE DESIGN. ESSENTIAL LAYERING.',
    description: 'Lightweight quilted vest with premium insulation. Packs into its own pocket for easy travel. The essential layering piece for unpredictable weather.',
    details: ['Recycled nylon shell', 'PrimaLoft insulation', 'Packable design', 'Stand collar', 'YKK zippers'],
    images: [
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=1200&q=80',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=1200&q=80',
    ],
    variants: {
      colors: ['Black', 'Navy', 'Olive'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  },

  // ============ ACCESSORIES ============
  {
    id: 'leather-backpack',
    name: 'The Leather Backpack',
    collection: 'accessories',
    price: 298,
    tagline: 'FULL-GRAIN LEATHER. LAPTOP SLEEVE. BUILT FOR THE COMMUTE.',
    description: 'Full-grain leather backpack with padded laptop sleeve and organized compartments. Vegetable-tanned leather develops a beautiful patina over time.',
    details: ['Full-grain vegetable-tanned leather', 'Fits 15" laptop', 'Padded back panel', 'YKK zippers', 'Brass hardware'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1600&q=80',
    variants: {
      colors: ['Black', 'Brown', 'Tan'],
      sizes: ['One Size'],
    },
  },
  {
    id: 'leather-cardholder',
    name: 'The Leather Cardholder',
    collection: 'accessories',
    price: 68,
    tagline: 'SLIM PROFILE. FULL-GRAIN LEATHER. RFID BLOCKING.',
    description: 'Minimalist cardholder in full-grain leather with RFID blocking technology. Holds up to 6 cards with a center cash slot. The wallet for the modern man.',
    details: ['Full-grain leather', 'RFID blocking', 'Holds 6 cards', 'Center cash slot', 'Edge-painted finish'],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&q=80',
      'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=1200&q=80',
    ],
    variants: {
      colors: ['Black', 'Brown', 'Navy'],
      sizes: ['One Size'],
    },
  },
  {
    id: 'structured-cap',
    name: 'The Structured Cap',
    collection: 'accessories',
    price: 58,
    tagline: 'JAPANESE COTTON TWILL. LEATHER STRAP. THE FINISHING TOUCH.',
    description: 'Premium structured cap in Japanese cotton twill with adjustable leather strap. Tonal embroidered logo and brass hardware. The ultimate finishing touch.',
    details: ['Japanese cotton twill', 'Adjustable leather strap', 'Tonal embroidery', 'Pre-curved brim', 'Brass hardware'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1200&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200&q=80',
    ],
    variants: {
      colors: ['Black', 'Navy', 'Khaki'],
      sizes: ['One Size'],
    },
  },
  {
    id: 'leather-belt',
    name: 'The Leather Belt',
    collection: 'accessories',
    price: 88,
    tagline: 'FULL-GRAIN BRIDLE LEATHER. SOLID BRASS BUCKLE. MADE TO AGE BEAUTIFULLY.',
    description: 'Classic dress belt in full-grain bridle leather with solid brass buckle. Hand-finished edges and vegetable-tanned leather that develops character over time.',
    details: ['Full-grain bridle leather', 'Solid brass buckle', 'Hand-finished edges', 'Width: 1.25"', 'Made in England'],
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=1200&q=80',
      'https://images.unsplash.com/photo-1585856331426-d7a22a186871?w=1200&q=80',
    ],
    variants: {
      colors: ['Black', 'Brown'],
      sizes: ['30', '32', '34', '36', '38', '40'],
    },
  },

  // ============ JEWELRY & WATCHES ============
  {
    id: 'cuban-chain',
    name: 'The Cuban Chain',
    collection: 'jewelry',
    price: 168,
    tagline: '18K GOLD VERMEIL. 5MM WIDTH. STATEMENT WITHOUT TRYING.',
    description: 'Classic Cuban link chain in 18K gold vermeil over sterling silver. 5mm width strikes the perfect balance between subtle and statement. Tarnish-resistant finish.',
    details: ['18K gold vermeil', 'Sterling silver base', '5mm width', 'Lobster clasp', 'Tarnish-resistant'],
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
    variants: {
      colors: ['Gold', 'Silver'],
      sizes: ['18"', '20"', '22"'],
    },
  },
  {
    id: 'signet-ring',
    name: 'The Signet Ring',
    collection: 'jewelry',
    price: 148,
    tagline: 'STERLING SILVER. BRUSHED FINISH. A TIMELESS STATEMENT.',
    description: 'Modern signet ring with brushed matte finish. Sterling silver construction with comfort fit band. The classic piece every man should own.',
    details: ['925 sterling silver', 'Brushed matte finish', 'Comfort fit band', 'Weight: 12g', 'Engraving available'],
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1200&q=80',
    ],
    variants: {
      colors: ['Silver', 'Gold'],
      sizes: ['8', '9', '10', '11', '12'],
    },
  },
  {
    id: 'minimal-bracelet',
    name: 'The Cuff Bracelet',
    collection: 'jewelry',
    price: 118,
    tagline: 'SOLID BRASS. HAND-FINISHED. MASCULINE MINIMALISM.',
    description: 'Solid brass cuff bracelet with hand-finished edges. Minimal design with subtle engraved logo. Adjustable to fit most wrist sizes.',
    details: ['Solid brass construction', 'Hand-finished edges', 'Adjustable fit', 'Width: 8mm', 'Tarnish-resistant coating'],
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1200&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80',
    ],
    variants: {
      colors: ['Gold', 'Silver', 'Black'],
      sizes: ['One Size'],
    },
  },
  {
    id: 'minimal-watch',
    name: 'The Field Watch',
    collection: 'jewelry',
    price: 248,
    tagline: 'JAPANESE MOVEMENT. SAPPHIRE CRYSTAL. DESIGNED FOR LIFE.',
    description: 'Minimalist field watch with Japanese automatic movement and sapphire crystal. 40mm case with interchangeable straps. Water-resistant to 100m.',
    details: ['Japanese automatic movement', 'Sapphire crystal', '40mm stainless steel case', '100m water resistance', 'Interchangeable straps'],
    images: [
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=1200&q=80',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&q=80',
    ],
    heroImage: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=1600&q=80',
    variants: {
      colors: ['Black', 'Silver'],
      sizes: ['One Size'],
    },
  },

  // ============ HOME & LIVING ============
  {
    id: 'throw-blanket',
    name: 'The Wool Throw',
    collection: 'home',
    price: 168,
    tagline: 'MERINO WOOL. WOVEN IN SCOTLAND. BUILT FOR GENERATIONS.',
    description: 'Luxurious merino wool throw woven in Scotland. Timeless herringbone pattern in neutral tones. The kind of piece that gets passed down.',
    details: ['100% merino wool', 'Woven in Scotland', 'Herringbone pattern', 'Fringed edges', 'Dimensions: 54" x 72"'],
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
    ],
    variants: {
      colors: ['Charcoal', 'Camel', 'Navy'],
      sizes: ['One Size'],
    },
  },
  {
    id: 'ceramic-mug',
    name: 'The Ceramic Mug',
    collection: 'home',
    price: 38,
    tagline: 'HANDCRAFTED STONEWARE. MATTE FINISH. START EACH DAY RIGHT.',
    description: 'Handcrafted stoneware mug with matte glaze finish. Substantial weight and feel. Microwave and dishwasher safe for everyday use.',
    details: ['Handcrafted stoneware', 'Matte glaze finish', 'Capacity: 12oz', 'Microwave safe', 'Dishwasher safe'],
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1200&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=1200&q=80',
    ],
    variants: {
      colors: ['Black', 'White', 'Stone'],
      sizes: ['12oz', '16oz'],
    },
  },
  {
    id: 'scented-candle',
    name: 'The Scented Candle',
    collection: 'home',
    price: 58,
    tagline: 'SOY WAX. 60-HOUR BURN. SIGNATURE MASCULINE SCENT.',
    description: 'Premium soy wax candle with our signature scent: leather, cedar, and tobacco. Cotton wick for clean burn. Hand-poured in small batches.',
    details: ['100% soy wax', '60-hour burn time', 'Cotton wick', 'Hand-poured', 'Weight: 8oz'],
    images: [
      'https://images.unsplash.com/photo-1602607650424-99f05c0ea9a2?w=1200&q=80',
      'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=1200&q=80',
    ],
    variants: {
      colors: ['Black Glass', 'Amber Glass'],
      sizes: ['8oz', '12oz'],
    },
  },
];

export default {
  collections: mockCollections,
  products: mockProducts,
};
