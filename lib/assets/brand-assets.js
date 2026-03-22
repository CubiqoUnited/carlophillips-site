/**
 * CARLOPHILLIPS - BRAND ASSETS CONFIGURATION
 * 
 * Centralized configuration for all brand assets.
 * Replace placeholder URLs with your actual brand assets.
 * 
 * ASSET UPLOAD GUIDE:
 * -------------------
 * 1. Logo files: Upload to your CDN or Shopify files, update URLs below
 * 2. Hero video: Upload to CDN (recommended: Cloudinary, Bunny.net, or Shopify)
 * 3. Campaign images: 1600px wide minimum, JPG/WebP format
 * 4. Collection banners: 1200px wide minimum
 * 5. Product images: Managed through Shopify or mock-data.js
 * 
 * RECOMMENDED SPECS:
 * -----------------
 * - Hero Video: 1920x1080 or 4K, MP4 format, H.264 codec, 15-30 seconds
 * - Campaign Stills: 1600x1200px minimum, JPG/WebP, <500KB compressed
 * - Collection Banners: 1200x800px minimum, JPG/WebP
 * - Logo (Primary): SVG preferred, or PNG with transparency
 * - Logo (Favicon): 32x32px, 192x192px, 512x512px PNG
 * - Product Images: 1200x1600px (3:4 ratio), JPG/WebP
 */

const brandAssets = {
  // ============================================
  // LOGO FILES
  // ============================================
  logo: {
    // Primary logo (SVG or PNG with transparency)
    // Replace with your logo URL
    primary: {
      url: null, // e.g., 'https://cdn.yourdomain.com/logo.svg'
      alt: 'CARLOPHILLIPS',
      width: 180,
      height: 40,
    },
    
    // Light version for dark backgrounds
    light: {
      url: null, // e.g., 'https://cdn.yourdomain.com/logo-light.svg'
      alt: 'CARLOPHILLIPS',
      width: 180,
      height: 40,
    },
    
    // Dark version for light backgrounds
    dark: {
      url: null, // e.g., 'https://cdn.yourdomain.com/logo-dark.svg'
      alt: 'CARLOPHILLIPS',
      width: 180,
      height: 40,
    },
    
    // Favicon files
    favicon: {
      ico: '/favicon.ico',
      png16: '/favicon-16x16.png',
      png32: '/favicon-32x32.png',
      apple: '/apple-touch-icon.png',
    },
  },

  // ============================================
  // HERO VIDEO
  // ============================================
  hero: {
    // Primary hero video for homepage
    video: {
      // Replace with your brand video URL
      url: null, // e.g., 'https://cdn.yourdomain.com/hero-video.mp4'
      
      // Fallback video (shown when primary is not set)
      fallback: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      
      // Poster image (shown before video loads)
      poster: null, // e.g., 'https://cdn.yourdomain.com/hero-poster.jpg'
      posterFallback: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80',
      
      // Video settings
      settings: {
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
      },
    },
    
    // Alternative hero image (for reduced motion preference)
    image: {
      url: null,
      fallback: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80',
      alt: 'CARLOPHILLIPS Summer Collection',
    },
  },

  // ============================================
  // CAMPAIGN STILLS
  // ============================================
  campaign: {
    // Main campaign images for homepage and marketing
    // Replace with your campaign photography
    stills: [
      {
        id: 'campaign-1',
        url: null,
        fallback: 'https://images.unsplash.com/photo-1698306871917-7b91b07a0bb4?w=1600&q=80',
        alt: 'Summer 2025 Campaign - Editorial 1',
        aspectRatio: '4:5',
      },
      {
        id: 'campaign-2',
        url: null,
        fallback: 'https://images.unsplash.com/photo-1614179689741-0ebd3f0ff34b?w=1600&q=80',
        alt: 'Summer 2025 Campaign - Editorial 2',
        aspectRatio: '4:5',
      },
      {
        id: 'campaign-3',
        url: null,
        fallback: 'https://images.pexels.com/photos/6070179/pexels-photo-6070179.jpeg?w=1600',
        alt: 'Summer 2025 Campaign - Editorial 3',
        aspectRatio: '4:5',
      },
      {
        id: 'campaign-4',
        url: null,
        fallback: 'https://images.unsplash.com/photo-1709600677254-0e961c8ed94e?w=1600&q=80',
        alt: 'Summer 2025 Campaign - Editorial 4',
        aspectRatio: '4:5',
      },
      {
        id: 'campaign-5',
        url: null,
        fallback: 'https://images.unsplash.com/photo-1550029402-8280f657d8d1?w=1600&q=80',
        alt: 'Summer 2025 Campaign - Editorial 5',
        aspectRatio: '4:5',
      },
      {
        id: 'campaign-6',
        url: null,
        fallback: 'https://images.pexels.com/photos/2986445/pexels-photo-2986445.jpeg?w=1600',
        alt: 'Summer 2025 Campaign - Editorial 6',
        aspectRatio: '4:5',
      },
    ],
  },

  // ============================================
  // COLLECTION BANNERS
  // ============================================
  collections: {
    // Hero images for collection pages
    // Replace with your collection photography
    banners: {
      essentials: {
        url: null,
        fallback: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200&q=80',
        alt: 'Essentials Collection',
      },
      outerwear: {
        url: null,
        fallback: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80',
        alt: 'Outerwear Collection',
      },
      accessories: {
        url: null,
        fallback: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80',
        alt: 'Accessories Collection',
      },
      home: {
        url: null,
        fallback: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200&q=80',
        alt: 'Home & Living Collection',
      },
      jewelry: {
        url: null,
        fallback: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=1200&q=80',
        alt: 'Jewelry & Watches Collection',
      },
      grooming: {
        url: null,
        fallback: 'https://images.unsplash.com/photo-1581750216968-5a5dca94588e?w=1200&q=80',
        alt: 'Grooming Collection',
      },
    },
  },

  // ============================================
  // ABOUT PAGE ASSETS
  // ============================================
  about: {
    hero: {
      url: null,
      fallback: 'https://images.unsplash.com/photo-1698306871917-7b91b07a0bb4?w=1600&q=80',
      alt: 'About CARLOPHILLIPS',
    },
    team: [],
    workshop: [],
  },

  // ============================================
  // SOCIAL & OG IMAGES
  // ============================================
  social: {
    // Open Graph / Social sharing image
    ogImage: {
      url: null, // e.g., 'https://cdn.yourdomain.com/og-image.jpg'
      fallback: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=630&fit=crop&q=80',
      width: 1200,
      height: 630,
      alt: 'CARLOPHILLIPS - Quiet Luxury',
    },
    // Twitter card image
    twitterImage: {
      url: null,
      fallback: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop&q=80',
      width: 1200,
      height: 600,
      alt: 'CARLOPHILLIPS - Quiet Luxury',
    },
  },

  // ============================================
  // PLACEHOLDER IMAGES
  // ============================================
  placeholders: {
    // Default product image placeholder
    product: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop&q=80',
    
    // Default collection image placeholder
    collection: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=800&fit=crop&q=80',
    
    // Avatar placeholder
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80',
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get asset URL with fallback
 * @param {Object} asset - Asset object with url and fallback
 * @returns {string} URL to use
 */
export function getAssetUrl(asset) {
  if (!asset) return '';
  return asset.url || asset.fallback || '';
}

/**
 * Get hero video URL
 * @returns {string} Video URL
 */
export function getHeroVideoUrl() {
  return brandAssets.hero.video.url || brandAssets.hero.video.fallback;
}

/**
 * Get hero poster URL
 * @returns {string} Poster URL
 */
export function getHeroPosterUrl() {
  return brandAssets.hero.video.poster || brandAssets.hero.video.posterFallback;
}

/**
 * Get logo URL (or null to use text)
 * @param {string} variant - 'primary' | 'light' | 'dark'
 * @returns {string|null} Logo URL or null
 */
export function getLogoUrl(variant = 'primary') {
  return brandAssets.logo[variant]?.url || null;
}

/**
 * Check if logo image is available
 * @returns {boolean}
 */
export function hasLogoImage() {
  return Boolean(brandAssets.logo.primary.url);
}

/**
 * Get campaign image by index
 * @param {number} index - Image index
 * @returns {Object} Campaign image object
 */
export function getCampaignImage(index) {
  const image = brandAssets.campaign.stills[index];
  if (!image) return null;
  return {
    ...image,
    src: image.url || image.fallback,
  };
}

/**
 * Get all campaign images
 * @returns {Object[]} Campaign images with resolved URLs
 */
export function getCampaignImages() {
  return brandAssets.campaign.stills.map(image => ({
    ...image,
    src: image.url || image.fallback,
  }));
}

/**
 * Get collection banner
 * @param {string} collectionId - Collection ID
 * @returns {Object} Banner object with resolved URL
 */
export function getCollectionBanner(collectionId) {
  const banner = brandAssets.collections.banners[collectionId];
  if (!banner) return null;
  return {
    ...banner,
    src: banner.url || banner.fallback,
  };
}

/**
 * Get Open Graph image URL
 * @returns {string} OG image URL
 */
export function getOgImageUrl() {
  return brandAssets.social.ogImage.url || brandAssets.social.ogImage.fallback;
}

/**
 * Get placeholder image
 * @param {string} type - 'product' | 'collection' | 'avatar'
 * @returns {string} Placeholder URL
 */
export function getPlaceholder(type = 'product') {
  return brandAssets.placeholders[type] || brandAssets.placeholders.product;
}

/**
 * Check if brand assets are configured
 * @returns {Object} Status of brand asset configuration
 */
export function getBrandAssetStatus() {
  return {
    hasLogo: Boolean(brandAssets.logo.primary.url),
    hasHeroVideo: Boolean(brandAssets.hero.video.url),
    hasHeroPoster: Boolean(brandAssets.hero.video.poster),
    hasCampaignImages: brandAssets.campaign.stills.some(img => img.url),
    hasCollectionBanners: Object.values(brandAssets.collections.banners).some(b => b.url),
    hasOgImage: Boolean(brandAssets.social.ogImage.url),
    totalCampaignImages: brandAssets.campaign.stills.length,
    configuredCampaignImages: brandAssets.campaign.stills.filter(img => img.url).length,
  };
}

export default brandAssets;

// Named exports for convenience
export const { logo, hero, campaign, collections, about, social, placeholders } = brandAssets;
