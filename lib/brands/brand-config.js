/**
 * CARLO BRAND ECOSYSTEM CONFIGURATION
 * 
 * Three brands under the CARLOPHILLIPS umbrella:
 * - CARLOPHILLIPS: Luxury premium line
 * - LOVECARLO: Colorful lifestyle line
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
    description: 'Premium menswear for those who appreciate understated elegance.',
    
    // Visual Identity
    theme: {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#b8860b', // Dark gold
      background: '#000000',
      text: '#ffffff',
    },
    
    // Collections to show for this brand
    collections: ['essentials', 'outerwear', 'accessories', 'jewelry'],
    
    // Hero content
    hero: {
      eyebrow: 'LUXURY COLLECTION',
      headline: 'Quiet\nLuxury',
      description: 'Premium menswear crafted for those who appreciate understated elegance and uncompromising quality.',
      cta: 'Shop Collection',
    },
    
    // Navigation style
    navStyle: 'minimal', // minimal, vibrant, warm
  },
  
  lovecarlo: {
    id: 'lovecarlo',
    name: 'LOVECARLO',
    tagline: 'Express Yourself',
    domain: 'lovecarlo.com',
    description: 'Vibrant, colorful pieces that let you express your unique style.',
    
    // Visual Identity
    theme: {
      primary: '#e63946', // Vibrant red
      secondary: '#f1faee',
      accent: '#a8dadc',
      background: '#1d3557',
      text: '#f1faee',
    },
    
    // Collections to show for this brand
    collections: ['essentials', 'outerwear', 'accessories'],
    
    // Hero content
    hero: {
      eyebrow: 'LIFESTYLE COLLECTION',
      headline: 'Love\nCarlo',
      description: 'Bold colors, playful designs, and streetwear energy for the modern trendsetter.',
      cta: 'Shop Now',
    },
    
    navStyle: 'vibrant',
  },
  
  houseofcarlo: {
    id: 'houseofcarlo',
    name: 'HOUSEOFCARLO',
    tagline: 'Live Beautifully',
    domain: 'houseofcarlo.com',
    description: 'Premium home goods and lifestyle accessories for refined living.',
    
    // Visual Identity
    theme: {
      primary: '#2d3436', // Charcoal
      secondary: '#dfe6e9',
      accent: '#74b9ff',
      background: '#0d1117',
      text: '#ffffff',
    },
    
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
