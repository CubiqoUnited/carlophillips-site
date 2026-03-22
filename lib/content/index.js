/**
 * Content Layer Index
 * 
 * Central export point for all site content.
 * Import from here to access editorial content.
 * 
 * Usage:
 * ```javascript
 * import { siteContent, homepage, about } from '@/lib/content';
 * 
 * // Access hero content
 * const heroText = homepage.hero.headline;
 * 
 * // Access site name
 * const siteName = siteContent.site.name;
 * ```
 */

import siteContent, { 
  site, 
  homepage, 
  collections, 
  about, 
  lookbook, 
  product, 
  cart, 
  footer, 
  navigation 
} from './site-content';

// Default export - full content object
export default siteContent;

// Named exports - individual sections
export { 
  siteContent,
  site, 
  homepage, 
  collections, 
  about, 
  lookbook, 
  product, 
  cart, 
  footer, 
  navigation 
};

// Utility function to get nested content safely
export function getContent(path, fallback = '') {
  const keys = path.split('.');
  let result = siteContent;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return fallback;
    }
  }
  
  return result ?? fallback;
}

// Utility to format headline with line breaks
export function formatHeadline(text) {
  if (!text) return '';
  return text.split('\\n').map((line, i, arr) => (
    i < arr.length - 1 ? [line, <br key={i} />] : line
  ));
}
