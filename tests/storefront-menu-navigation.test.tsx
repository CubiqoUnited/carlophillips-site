import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STOREFRONT_MENU_CATEGORIES,
  STOREFRONT_MENU_ALL_CATEGORIES,
  STOREFRONT_MENU_HOME,
  STOREFRONT_MENU_SUPPORT_LINKS,
} from '../apps/web/src/lib/navigation/storefront-menu.ts';

describe('storefront menu navigation consistency', () => {
  it('defines the approved shared destinations', () => {
    expect(STOREFRONT_MENU_HOME.href).toBe('/');
    expect(STOREFRONT_MENU_ALL_CATEGORIES.href).toBe('/shop');
    expect(
      DEFAULT_STOREFRONT_MENU_CATEGORIES.map((category) => category.href)
    ).toEqual(['/shop?category=tshirts', '/shop?category=hoodies']);
    expect(STOREFRONT_MENU_SUPPORT_LINKS.map((link) => link.href)).toEqual([
      '/aftercare',
      '/contact',
      '/member',
      '/private-list',
    ]);
  });

  it('wires the same destinations into the inner-page hamburger menu', () => {
    const source = readFileSync(
      'apps/web/src/components/layout/StorefrontHeader/index.tsx',
      'utf8'
    );

    expect(source).toContain("from '@/lib/navigation/storefront-menu'");
    expect(source).toContain('STOREFRONT_MENU_HOME.href');
    expect(source).toContain('STOREFRONT_MENU_ALL_CATEGORIES.href');
    expect(source).toContain('resolveStorefrontMenuCategories');
    expect(source).toContain('STOREFRONT_MENU_SUPPORT_LINKS.map');
    expect(source).toContain('aria-label="Mobile storefront navigation"');
  });

  it('matches the approved landing workbook menu information architecture', () => {
    const source = readFileSync(
      'apps/web/src/components/editorial/WorkbookReplica.tsx',
      'utf8'
    );

    expect(source).toContain('id="menu-discovery">DISCOVERY');
    expect(source).toContain('STOREFRONT_MENU_ALL_CATEGORIES.menuLabel');
    expect(source).toContain('resolveStorefrontMenuCategories().map');
    expect(source).toContain('id="menu-private-support">MORE');
    expect(source).toContain('STOREFRONT_MENU_SUPPORT_LINKS.map');
    expect(source).toContain("setSurface('private-list')");
  });
});
