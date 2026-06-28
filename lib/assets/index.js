/**
 * Assets Layer Index
 * 
 * Central export point for all brand assets.
 * 
 * Usage:
 * ```javascript
 * import { getHeroVideoUrl, getCampaignImages, hasLogoImage } from '@/lib/assets';
 * 
 * const videoUrl = getHeroVideoUrl();
 * const images = getCampaignImages();
 * ```
 */

import brandAssets, {
  getAssetUrl,
  getHeroVideoUrl,
  getHeroPosterUrl,
  getLogoUrl,
  hasLogoImage,
  getCampaignImage,
  getCampaignImages,
  getCollectionBanner,
  getOgImageUrl,
  getPlaceholder,
  getBrandAssetStatus,
  logo,
  hero,
  campaign,
  collections,
  about,
  social,
  placeholders,
} from './brand-assets';

// Default export
export default brandAssets;

// Named exports
export {
  brandAssets,
  getAssetUrl,
  getHeroVideoUrl,
  getHeroPosterUrl,
  getLogoUrl,
  hasLogoImage,
  getCampaignImage,
  getCampaignImages,
  getCollectionBanner,
  getOgImageUrl,
  getPlaceholder,
  getBrandAssetStatus,
  logo,
  hero,
  campaign,
  collections,
  about,
  social,
  placeholders,
};
