/**
 * CARLO BRAND ECOSYSTEM CONFIGURATION
 * 
 * Three brands under the CARLOPHILLIPS umbrella:
 * - CARLOPHILLIPS: Luxury premium line (navy, grey, white, burgundy)
 * - LOVECARLO: Colorful lifestyle line (orange, red/navy/sky blue, retro stripes)
 * - HOUSEOFCARLO: Home & living line
 * 
 * All share the same cart and checkout via Shopify.
 */

export const brands = {
  carlophillips: {
    id: 'carlophillips',
    name: 'CARLOPHILLIPS',
    tagline: 'Quiet Luxury',
    domain: 'carlophillips.com',
    description: 'Geometric luxury menswear with a restrained palette and precise product language.',
    
    // Visual Identity - Muted luxury palette
    theme: {
      primary: '#151a2f',      // Deep navy
      secondary: '#f4f1ec',     // Warm off-white
      accent: '#b21f2d',        // Controlled red
      background: '#000000',
      text: '#ffffff',
      muted: '#8d929d',         // Graphite grey
    },
    
    // Product colors available
    productColors: ['White', 'Grey', 'Navy', 'Burgundy', 'Black'],
    
    // Collections to show for this brand
    collections: ['essentials', 'outerwear', 'accessories', 'jewelry'],
    
    // Hero content
    hero: {
      eyebrow: '2026 COMMON ERA',
      headline: 'Geometric\nLuxury',
      description: 'A sharper CARLOPHILLIPS system: graphic marks, premium neutrals, and runway-ready everyday pieces.',
      cta: 'Review Product',
    },
    
    // Flat lay image for this brand
    flatLayImage: '/brand/carlo-geometric-word.png',
    
    navStyle: 'minimal',
  },
  
  lovecarlo: {
    id: 'lovecarlo',
    name: 'LOVECARLO',
    tagline: 'Express Yourself',
    domain: 'lovecarlo.com',
    description: 'Vibrant, colorful pieces that let you express your unique style.',
    
    // Visual Identity - Colorful streetwear palette
    theme: {
      primary: '#ff6b00',       // Vibrant orange
      secondary: '#1a1a2e',     // Navy
      accent: '#e63946',        // Red
      background: '#0d1117',
      text: '#ffffff',
      skyBlue: '#a8d5e5',       // Sky blue for colorblock
    },
    
    // Product colors available
    productColors: ['Orange', 'Black', 'White', 'Red', 'Navy', 'Sky Blue'],
    
    // Sub-collections
    subCollections: [
      { id: 'love-script', name: '"love" Script', colors: ['Orange', 'Black', 'White'] },
      { id: 'love-colorblock', name: 'LOVE.Carlo Colorblock', colors: ['Red', 'Navy', 'Sky Blue', 'White'] },
      { id: 'love-monochrome', name: 'Orange Monochrome', colors: ['Orange'] },
      { id: 'love-retro', name: 'Love,Carlo Retro', colors: ['Navy', 'Orange', 'Cream'] },
    ],
    
    // Collections to show for this brand
    collections: ['essentials', 'outerwear', 'accessories'],
    
    // Hero content
    hero: {
      eyebrow: 'LIFESTYLE COLLECTION',
      headline: 'Love\nCarlo',
      description: 'Bold colors, playful designs, and streetwear energy for the modern trendsetter.',
      cta: 'Shop Now',
    },
    
    // Flat lay images for different collections
    flatLayImages: [
      'https://customer-assets.emergentagent.com/job_c8d11765-3066-436d-8118-a3922c519218/artifacts/0o4bgpq7_ChatGPT%20Image%20Mar%2024%2C%202026%2C%2008_19_40%20AM.png',
      'https://customer-assets.emergentagent.com/job_c8d11765-3066-436d-8118-a3922c519218/artifacts/vkrpsexn_ChatGPT%20Image%20Mar%2024%2C%202026%2C%2008_19_13%20AM.png',
      'https://customer-assets.emergentagent.com/job_c8d11765-3066-436d-8118-a3922c519218/artifacts/gslolpov_ChatGPT%20Image%20Mar%2024%2C%202026%2C%2008_18_59%20AM.png',
      'https://customer-assets.emergentagent.com/job_c8d11765-3066-436d-8118-a3922c519218/artifacts/y01egjbd_ChatGPT%20Image%20Mar%2024%2C%202026%2C%2008_18_54%20AM.png',
    ],
    
    navStyle: 'vibrant',
  },
  
  houseofcarlo: {
    id: 'houseofcarlo',
    name: 'HOUSEOFCARLO',
    tagline: 'Live Beautifully',
    domain: 'houseofcarlo.com',
    description: 'Premium home goods and lifestyle accessories for refined living.',
    
    // Visual Identity - Warm, cozy palette
    theme: {
      primary: '#2d3436',       // Charcoal
      secondary: '#dfe6e9',     // Light grey
      accent: '#d4a373',        // Warm tan
      background: '#0d1117',
      text: '#ffffff',
      cream: '#faf3e0',         // Cream
    },
    
    // Product colors available
    productColors: ['Cream', 'Charcoal', 'Tan', 'White', 'Black'],
    
    // Collections to show for this brand
    collections: ['home', 'accessories', 'grooming'],
    
    // Hero content
    hero: {
      eyebrow: 'HOME COLLECTION',
      headline: 'House of\nCarlo',
      description: 'Elevate your space with thoughtfully designed home goods and lifestyle essentials.',
      cta: 'Explore Home',
    },
    
    navStyle: 'warm',
  },
};

// Brand order for navigation
export const brandOrder = ['carlophillips', 'lovecarlo', 'houseofcarlo'];

// Default brand
export const defaultBrand = 'carlophillips';

/**
 * Detect brand from hostname
 * @param {string} hostname - Current hostname
 * @returns {string} Brand ID
 */
export function detectBrandFromDomain(hostname) {
  if (!hostname) return defaultBrand;
  
  const host = hostname.toLowerCase();
  
  if (host.includes('lovecarlo')) return 'lovecarlo';
  if (host.includes('houseofcarlo')) return 'houseofcarlo';
  
  // Default to carlophillips for main domain or preview
  return 'carlophillips';
}

/**
 * Get brand configuration
 * @param {string} brandId - Brand ID
 * @returns {Object} Brand config
 */
export function getBrand(brandId) {
  return brands[brandId] || brands[defaultBrand];
}

/**
 * Get all brands
 * @returns {Object[]} Array of brands in order
 */
export function getAllBrands() {
  return brandOrder.map(id => brands[id]);
}

export default brands;
