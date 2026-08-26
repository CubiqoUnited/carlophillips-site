import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { routeMetadata } from '../lib/site/site-config.js';

describe('storefront route policy', () => {
  it('keeps home bound to the shared server catalog decision', () => {
    const source = readFileSync('app/page.js', 'utf8');
    expect(source).toContain('getServerCatalogDecision');
    expect(source).toContain('toHomeCatalogSummary');
    expect(source).toContain('components/storefront/home-storefront');
    expect(source).not.toContain('signature-hoodie-preview');
  });

  it('removes the editorial shell, editorial-only routes, and copy abstraction', () => {
    for (const path of [
      'components/editorial/app-shell.jsx',
      'app/about/page.js',
      'app/lookbook/page.js',
      'lib/content/index.js',
      'lib/content/site-content.js',
    ]) {
      expect(existsSync(path), `${path} must remain absent`).toBe(false);
    }
  });

  it('keeps the storefront client free of product fixtures and Shopify transport', () => {
    const source = readFileSync('components/storefront/home-storefront.jsx', 'utf8');
    const discovery = readFileSync('components/storefront/discovery-section.jsx', 'utf8');
    const landing = readFileSync('components/storefront/landing-morph.jsx', 'utf8');
    for (const file of [source, discovery, landing]) {
      expect(file).not.toContain('signature-hoodie-preview');
      expect(file).not.toContain('loadShopifyProduct');
      expect(file).not.toContain('SHOPIFY_');
    }
    expect(discovery).toContain('Add to bag');
    expect(discovery).toContain('action="/api/checkout"');
    expect(landing).toContain('At the<br />edge of life.');
  });

  it('renders the landing hero only from a media readiness decision', () => {
    const page = readFileSync('app/page.js', 'utf8');
    const landing = readFileSync('components/storefront/landing-morph.jsx', 'utf8');
    expect(page).toContain('getMediaReadiness');
    expect(page).toContain('mediaReadiness={getMediaReadiness()}');
    // The hero source is never a literal in the view: it comes from the verified decision only.
    expect(landing).not.toContain('/campaigns/');
    expect(landing).toContain('hero?.motionAllowed && hero.sourceUrl');
    expect(landing).toContain('hero?.posterUrl');
  });

  it('publishes only active product and commerce routes in the sitemap', () => {
    const source = readFileSync('app/sitemap.js', 'utf8');
    const robots = readFileSync('app/robots.js', 'utf8');
    expect(source).toContain('/shop');
    expect(source).toContain('/collections');
    expect(source).not.toContain('/about');
    expect(source).not.toContain('/lookbook');
    expect(robots).not.toContain('/about');
    expect(robots).not.toContain('/lookbook');
  });

  it('keeps site metadata aligned with the active Signature Series', () => {
    const source = readFileSync('lib/site/site-config.js', 'utf8');
    expect(source).toContain("tagline: 'Signature Series'");
    expect(source).toContain('Product availability and checkout remain release-gated.');
    expect(source).not.toContain('Gesture of Luxury');
  });

  it('keeps public indexing fail-closed outside Production', () => {
    expect(routeMetadata({ title: 'Preview', description: 'Preview', path: '/' }).robots).toEqual({
      index: false,
      follow: false,
    });
    const layout = readFileSync('app/layout.js', 'utf8');
    expect(layout).toContain('index: publicIndexingEnabled');
    expect(layout).toContain('follow: publicIndexingEnabled');
  });

  it('keeps draft campaign studies out of public artifacts and routes', () => {
    const ignore = readFileSync('.vercelignore', 'utf8');
    expect(ignore).toContain('public/campaigns/draft-pod/');
    expect(existsSync('app/concept-preview/page.js')).toBe(false);
    expect(existsSync('public/campaigns/draft-pod')).toBe(false);
    expect(existsSync('docs/archive/draft-pod/edge-of-life-runway-desktop-v1.jpg')).toBe(true);
  });

  it('renders one home footer with policy links and keeps optional analytics UI absent', () => {
    const home = readFileSync('components/storefront/home-storefront.jsx', 'utf8');
    const policies = readFileSync('components/storefront/site-policies-footer.jsx', 'utf8');
    const layout = readFileSync('app/layout.js', 'utf8');
    expect(home).toContain('<Link href="/privacy">Privacy</Link>');
    expect(home).toContain('<Link href="/terms">Terms</Link>');
    expect(home).toContain('<Link href="/cookie-policy">Cookies</Link>');
    expect(policies).toContain("if (pathname === '/') return null");
    expect(layout).not.toContain('ConsentPreferences');
    expect(existsSync('components/privacy/consent-preferences.jsx')).toBe(false);
  });

  it('uses route metadata for the canonical shop and collections surfaces', () => {
    const shop = readFileSync('app/shop/page.js', 'utf8');
    const collections = readFileSync('app/collections/page.js', 'utf8');
    expect(shop).toContain("title: 'Shop | CARLOPHILLIPS'");
    expect(shop).toContain("path: '/shop'");
    expect(collections).toContain('routeMetadata');
    expect(collections).toContain("title: 'Collections | CARLOPHILLIPS'");
    expect(collections).toContain("path: '/collections'");
  });
});
