// Mock product data based on Printify categories for luxury brand
// These categories align with Printify's print-on-demand offerings

export const collections = [
  {
    id: 'essentials',
    name: 'Essentials',
    description: 'Timeless basics crafted for everyday elegance',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
    featured: true,
  },
  {
    id: 'outerwear',
    name: 'Outerwear',
    description: 'Statement pieces for the modern wardrobe',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    featured: true,
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Refined details that complete the look',
    image: 'https://images.unsplash.com/photo-1614179689741-0ebd3f0ff34b?w=800&q=80',
    featured: true,
  },
  {
    id: 'home',
    name: 'Home & Living',
    description: 'Curated pieces for mindful living spaces',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80',
    featured: true,
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    description: 'Minimalist adornments with quiet luxury',
    image: 'https://images.unsplash.com/photo-1709600677254-0e961c8ed94e?w=800&q=80',
    featured: false,
  },
];

export const products = [
  // ESSENTIALS - Printify: T-shirts, Hoodies, Sweatshirts
  {
    id: 'essential-tee-black',
    name: 'Essential Tee',
    collection: 'essentials',
    price: 68,
    description: 'Our signature essential tee, crafted from premium organic cotton with a relaxed silhouette. The perfect foundation for any wardrobe.',
    details: ['100% organic cotton', 'Relaxed fit', 'Pre-shrunk', 'Made in Portugal'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    ],
    variants: {
      colors: ['Black', 'White', 'Stone'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Unisex T-Shirt',
  },
  {
    id: 'oversized-hoodie',
    name: 'Oversized Hoodie',
    collection: 'essentials',
    price: 128,
    description: 'Luxuriously soft oversized hoodie with dropped shoulders and minimalist design. Elevated comfort for the discerning individual.',
    details: ['French terry cotton', 'Oversized fit', 'Kangaroo pocket', 'Ribbed cuffs'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80',
    ],
    variants: {
      colors: ['Charcoal', 'Cream', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Pullover Hoodie',
  },
  {
    id: 'crewneck-sweatshirt',
    name: 'Classic Crewneck',
    collection: 'essentials',
    price: 98,
    description: 'A refined take on the classic crewneck sweatshirt. Clean lines and premium weight fabric.',
    details: ['Heavyweight cotton blend', 'Regular fit', 'Brushed interior', 'Reinforced seams'],
    images: [
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    ],
    variants: {
      colors: ['Heather Grey', 'Black', 'Ecru'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Crewneck Sweatshirt',
  },
  // OUTERWEAR - Printify: Jackets
  {
    id: 'bomber-jacket',
    name: 'Bomber Jacket',
    collection: 'outerwear',
    price: 248,
    description: 'Modern interpretation of the classic bomber. Water-resistant exterior with quilted lining.',
    details: ['Water-resistant nylon', 'Quilted lining', 'YKK zippers', 'Ribbed collar and cuffs'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80',
    ],
    variants: {
      colors: ['Black', 'Olive', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Bomber Jacket',
  },
  {
    id: 'windbreaker',
    name: 'Technical Windbreaker',
    collection: 'outerwear',
    price: 198,
    description: 'Lightweight technical windbreaker with concealed hood. Perfect for transitional weather.',
    details: ['Ripstop nylon', 'Packable design', 'Concealed hood', 'Adjustable hem'],
    images: [
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=80',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&q=80',
    ],
    variants: {
      colors: ['Stone', 'Black', 'Forest'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    printifyCategory: 'Windbreaker',
  },
  // ACCESSORIES - Printify: Bags, Hats
  {
    id: 'canvas-tote',
    name: 'Canvas Tote',
    collection: 'accessories',
    price: 58,
    description: 'Oversized canvas tote with reinforced handles. Carries everything with understated elegance.',
    details: ['Heavy canvas', 'Interior pocket', 'Reinforced handles', 'Natural canvas base'],
    images: [
      'https://images.unsplash.com/photo-1614179689741-0ebd3f0ff34b?w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    ],
    variants: {
      colors: ['Natural', 'Black'],
      sizes: ['One Size'],
    },
    printifyCategory: 'Canvas Tote Bag',
  },
  {
    id: 'structured-cap',
    name: 'Structured Cap',
    collection: 'accessories',
    price: 48,
    description: 'Minimalist structured cap with tonal embroidery. The finishing touch.',
    details: ['Cotton twill', 'Adjustable strap', 'Tonal embroidery', 'Pre-curved brim'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
    ],
    variants: {
      colors: ['Black', 'White', 'Khaki'],
      sizes: ['One Size'],
    },
    printifyCategory: 'Dad Hat',
  },
  // HOME & LIVING - Printify: Blankets, Pillows, Mugs, Wall Art
  {
    id: 'throw-blanket',
    name: 'Signature Throw',
    collection: 'home',
    price: 128,
    description: 'Plush woven throw blanket with subtle monogram. Cozy sophistication for any space.',
    details: ['Woven cotton blend', '50" x 60"', 'Machine washable', 'Fringed edges'],
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    variants: {
      colors: ['Ivory', 'Grey', 'Black'],
      sizes: ['50x60'],
    },
    printifyCategory: 'Woven Blanket',
  },
  {
    id: 'accent-pillow',
    name: 'Accent Pillow',
    collection: 'home',
    price: 68,
    description: 'Velvet accent pillow with hidden zipper. Subtle luxury for your living space.',
    details: ['Velvet cover', 'Polyester fill', 'Hidden zipper', 'Double-sided print'],
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
      'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80',
    ],
    variants: {
      colors: ['Charcoal', 'Cream', 'Blush'],
      sizes: ['18x18', '20x20'],
    },
    printifyCategory: 'Pillow',
  },
  {
    id: 'ceramic-mug',
    name: 'Ceramic Mug',
    collection: 'home',
    price: 32,
    description: 'Minimalist ceramic mug with matte finish. Start each day with intention.',
    details: ['Ceramic construction', '11oz capacity', 'Microwave safe', 'Dishwasher safe'],
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&q=80',
    ],
    variants: {
      colors: ['White', 'Black'],
      sizes: ['11oz', '15oz'],
    },
    printifyCategory: 'Ceramic Mug',
  },
  // JEWELRY - CJ Dropshipping compatible
  {
    id: 'minimal-pendant',
    name: 'Minimal Pendant',
    collection: 'jewelry',
    price: 88,
    description: 'Delicate pendant necklace with geometric charm. Quiet luxury that speaks volumes.',
    details: ['18k gold vermeil', '18" chain', 'Lobster clasp', 'Hypoallergenic'],
    images: [
      'https://images.unsplash.com/photo-1709600677254-0e961c8ed94e?w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    ],
    variants: {
      colors: ['Gold', 'Silver'],
      sizes: ['18"', '20"'],
    },
    dropshipSource: 'CJ Dropshipping',
  },
  {
    id: 'signet-ring',
    name: 'Signet Ring',
    collection: 'jewelry',
    price: 118,
    description: 'Modern signet ring with brushed finish. A timeless statement piece.',
    details: ['Sterling silver', 'Brushed finish', 'Comfort fit', 'Unisex design'],
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
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
