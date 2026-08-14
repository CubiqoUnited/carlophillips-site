import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { designSystemRuntimeContract } from '../lib/design-system/runtime-contract.js';

const tokenPath = 'app/design-tokens.css';
const globalPath = 'app/globals.css';
const activeCustomerFiles = [
  'app/layout.js',
  'app/concept-preview/page.js',
  'components/storefront/home-storefront.jsx',
  'components/storefront/storefront-header.jsx',
  'components/storefront/site-policies-footer.jsx',
  'components/privacy/consent-preferences.jsx',
  'components/privacy/policy-page.jsx',
  'components/commerce/catalog-state.jsx',
  'components/commerce/bag-state.jsx',
  'components/commerce/product-detail.jsx',
  'components/commerce/shopify-checkout-form.jsx',
];

function parseCss(file) {
  return postcss.parse(readFileSync(file, 'utf8'), { from: file });
}

function references(value) {
  return [...value.matchAll(/var\((--cp-[a-z0-9-]+)/g)].map(match => match[1]);
}

function declarations(root) {
  const result = [];
  root.walkDecls(/^--cp-/, declaration => result.push(declaration));
  return result;
}

function tokenValues() {
  const values = new Map();
  for (const declaration of declarations(parseCss(tokenPath))) {
    if (!values.has(declaration.prop)) values.set(declaration.prop, []);
    values.get(declaration.prop).push(declaration.value);
  }
  return values;
}

function firstTokenValue(values, name) {
  return values.get(name)?.[0];
}

function selectorDeclarations(selector) {
  const result = {};
  parseCss(globalPath).walkRules(rule => {
    const selectors = rule.selector?.split(',').map(value => value.trim()) || [];
    if (!selectors.includes(selector)) return;
    rule.walkDecls(declaration => {
      result[declaration.prop] = declaration.value;
    });
  });
  return result;
}

function classLiterals(source) {
  const literals = [];
  for (const match of source.matchAll(/className\s*=\s*["']([^"']*)["']/g)) literals.push(match[1]);
  for (const match of source.matchAll(/className\s*=\s*\{`([\s\S]*?)`\}/g)) {
    literals.push(match[1].replace(/\$\{[\s\S]*?\}/g, ' '));
    for (const stringMatch of match[1].matchAll(/["']([^"']+)["']/g)) literals.push(stringMatch[1]);
  }
  for (const match of source.matchAll(/className\s*=\s*\{([^}]+)\}/g)) {
    for (const stringMatch of match[1].matchAll(/["']([^"']+)["']/g)) literals.push(stringMatch[1]);
  }
  return literals;
}

describe('storefront design system', () => {
  it('enforces lowercase kebab-case names and strict primitive to semantic to component direction', () => {
    const root = parseCss(tokenPath);
    const values = tokenValues();

    expect(values.size).toBeGreaterThan(100);
    for (const declaration of declarations(root)) {
      expect(declaration.prop, 'invalid token name').toMatch(/^--cp-(?:primitive|semantic|component)-(?:[a-z0-9]+-)*[a-z0-9]+$/);
      const refs = references(declaration.value);
      if (declaration.prop.startsWith('--cp-primitive-')) {
        expect(refs, `${declaration.prop} bypasses primitive authority`).toEqual([]);
      } else if (declaration.prop.startsWith('--cp-semantic-')) {
        expect(refs.length, `${declaration.prop} has no primitive dependency`).toBeGreaterThan(0);
        expect(refs.every(ref => ref.startsWith('--cp-primitive-')), declaration.prop).toBe(true);
      } else {
        expect(refs.length, `${declaration.prop} has no semantic dependency`).toBeGreaterThan(0);
        expect(refs.every(ref => ref.startsWith('--cp-semantic-')), declaration.prop).toBe(true);
      }
    }

    const duplicates = [];
    root.walkRules(rule => {
      const seen = new Set();
      for (const declaration of rule.nodes.filter(node => node.type === 'decl' && node.prop.startsWith('--cp-'))) {
        if (seen.has(declaration.prop)) duplicates.push(`${declaration.prop} at ${declaration.source.start.line}`);
        seen.add(declaration.prop);
      }
    });
    expect(duplicates).toEqual([]);
  });

  it('covers every required design domain and closes every reference', () => {
    const values = tokenValues();
    const names = new Set(values.keys());
    const requiredPrimitiveDomains = [
      'border', 'breakpoint', 'color', 'delay', 'duration', 'easing', 'effect',
      'font', 'layer', 'layout', 'media', 'motion', 'opacity', 'radius', 'ratio',
      'runtime', 'size', 'space',
    ];

    for (const domain of requiredPrimitiveDomains) {
      expect([...names].some(name => name.startsWith(`--cp-primitive-${domain}-`)), domain).toBe(true);
    }
    for (const tier of ['primitive', 'semantic', 'component']) {
      expect([...names].some(name => name.startsWith(`--cp-${tier}-`)), tier).toBe(true);
    }

    for (const [name, variants] of values) {
      for (const value of variants) {
        for (const reference of references(value)) expect(names.has(reference), `${name} -> ${reference}`).toBe(true);
      }
    }
    const globals = parseCss(globalPath);
    globals.walkDecls(declaration => {
      for (const reference of references(declaration.value)) expect(names.has(reference), `${globalPath} -> ${reference}`).toBe(true);
    });
  });

  it('keeps no dormant token declarations outside verified runtime mirrors', () => {
    const values = tokenValues();
    const reachable = new Set();
    const addReferences = declaration => references(declaration.value).forEach(reference => reachable.add(reference));

    parseCss(globalPath).walkDecls(addReferences);
    parseCss(tokenPath).walkDecls(declaration => {
      if (!declaration.prop.startsWith('--cp-')) addReferences(declaration);
    });
    for (const name of values.keys()) {
      if (
        name.startsWith('--cp-component-open-graph-')
        || name.startsWith('--cp-semantic-runtime-image-')
        || name.startsWith('--cp-primitive-breakpoint-')
      ) reachable.add(name);
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (const name of [...reachable]) {
        for (const value of values.get(name) || []) {
          for (const reference of references(value)) {
            if (!reachable.has(reference)) {
              reachable.add(reference);
              changed = true;
            }
          }
        }
      }
    }
    expect([...values.keys()].filter(name => !reachable.has(name))).toEqual([]);
  });

  it('keeps all active CSS declarations token-led and all responsive literals canonical', () => {
    const globals = parseCss(globalPath);
    const rawDeclarations = [];
    globals.walkDecls(declaration => {
      if (!declaration.value.includes('var(--cp-')) {
        rawDeclarations.push(`${declaration.prop}: ${declaration.value} at ${declaration.source.start.line}`);
      }
      expect(declaration.value).not.toContain('var(--cp-primitive-');
    });
    expect(rawDeclarations).toEqual([]);

    const globalMedia = [];
    globals.walkAtRules('media', rule => globalMedia.push(rule.params));
    expect(globalMedia).toEqual(['(prefers-reduced-motion: reduce)']);

    const tokenMedia = [];
    parseCss(tokenPath).walkAtRules('media', rule => tokenMedia.push(rule.params));
    expect(tokenMedia).toEqual([
      '(min-width: 40rem)',
      '(min-width: 48rem)',
      '(min-width: 64rem)',
      '(min-width: 80rem)',
    ]);
  });

  it('binds unavoidable browser serialization literals to the CSS authority', () => {
    const values = tokenValues();
    const remToPx = value => Number.parseFloat(value) * 16;
    const breakpoints = designSystemRuntimeContract.breakpoints;

    expect(breakpoints.smallPx).toBe(remToPx(firstTokenValue(values, '--cp-primitive-breakpoint-small')));
    expect(breakpoints.tabletPx).toBe(remToPx(firstTokenValue(values, '--cp-primitive-breakpoint-tablet')));
    expect(breakpoints.desktopPx).toBe(remToPx(firstTokenValue(values, '--cp-primitive-breakpoint-desktop')));
    expect(breakpoints.widePx).toBe(remToPx(firstTokenValue(values, '--cp-primitive-breakpoint-wide')));
    expect(designSystemRuntimeContract.media.desktopMin).toBe(`(min-width: ${breakpoints.desktopPx}px)`);
    expect(designSystemRuntimeContract.media.tabletMin).toBe(`(min-width: ${breakpoints.tabletPx}px)`);
    expect(designSystemRuntimeContract.media.tabletMax).toBe(`(max-width: ${breakpoints.tabletPx - 1}px)`);
    expect(designSystemRuntimeContract.media.wideMin).toBe(`(min-width: ${breakpoints.widePx}px)`);

    expect(designSystemRuntimeContract.theme.canvas).toBe(firstTokenValue(values, '--cp-primitive-color-neutral-000'));
    expect(designSystemRuntimeContract.openGraph.canvas.background).toBe(firstTokenValue(values, '--cp-primitive-color-neutral-025'));
    expect(designSystemRuntimeContract.openGraph.canvas.color).toBe(firstTokenValue(values, '--cp-primitive-color-neutral-1000'));
    expect(`${designSystemRuntimeContract.openGraph.size.width / 16}rem`).toBe(firstTokenValue(values, '--cp-primitive-size-open-graph-width'));
    expect(`${designSystemRuntimeContract.openGraph.size.height / 16}rem`).toBe(firstTokenValue(values, '--cp-primitive-size-open-graph-height'));
    expect(designSystemRuntimeContract.imageSizes.galleryAsset).toContain(firstTokenValue(values, '--cp-primitive-runtime-image-gallery-width'));
    expect(designSystemRuntimeContract.imageSizes.productPanel).toContain(firstTokenValue(values, '--cp-primitive-runtime-image-product-panel-width'));
    expect(designSystemRuntimeContract.imageSizes.productDetail).toContain(firstTokenValue(values, '--cp-primitive-runtime-image-product-detail-width'));
    expect(designSystemRuntimeContract.behavior.smoothScroll).toBe(firstTokenValue(values, '--cp-primitive-layout-scroll-behavior'));
    expect(designSystemRuntimeContract.behavior.instantScroll).toBe(firstTokenValue(values, '--cp-primitive-layout-size-auto'));
    expect(designSystemRuntimeContract.media.reducedMotion).toBe('(prefers-reduced-motion: reduce)');

    const runtimeSource = readFileSync('lib/design-system/runtime-contract.js', 'utf8');
    const openGraphSource = readFileSync('app/opengraph-image.js', 'utf8');
    expect(runtimeSource).toContain('only permitted runtime literals');
    expect(openGraphSource).not.toContain('style={{');
    expect(openGraphSource.match(/style=/g)).toHaveLength(4);
    expect(openGraphSource.match(/designSystemRuntimeContract\.openGraph\./g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('forbids inline styles, raw visual literals, arbitrary utilities, and non-CP classes on customer surfaces', () => {
    const rawVisual = /#[0-9a-f]{3,8}\b|rgba?\(|\b-?(?:\d*\.)?\d+(?:px|rem|em|vw|vh|svh|dvh|ms|s)\b/i;

    for (const file of activeCustomerFiles) {
      const source = readFileSync(file, 'utf8');
      expect(source, `${file} contains a source inline style`).not.toMatch(/\sstyle=/);
      expect(source, `${file} contains a raw customer visual literal`).not.toMatch(rawVisual);
      expect(source, `${file} contains a literal Image sizes contract`).not.toMatch(/\bsizes=["']/);
      expect(source, `${file} contains a literal source media contract`).not.toMatch(/<source\b[^>]*\bmedia=["']/);
      expect(source, `${file} contains an icon stroke decision`).not.toMatch(/\bstrokeWidth=/);
      expect(source, `${file} contains an arbitrary utility`).not.toMatch(/[a-z-]+-\[[^\]]+\]/);

      for (const literal of classLiterals(source)) {
        const classes = literal.trim().split(/\s+/).filter(Boolean);
        expect(classes.filter(name => !name.startsWith('cp-')), `${file}: ${literal}`).toEqual([]);
      }
    }
  });

  it('proves representative primitive changes propagate through semantic and component aliases', () => {
    const tokens = readFileSync(tokenPath, 'utf8');
    const styles = readFileSync(globalPath, 'utf8');

    expect(tokens).toContain('--cp-semantic-color-canvas: var(--cp-primitive-color-neutral-000)');
    expect(styles).toContain('background: var(--cp-semantic-color-canvas)');
    expect(tokens).toContain('--cp-semantic-radius-card: var(--cp-primitive-radius-none)');
    expect(tokens).toContain('--cp-component-card-radius: var(--cp-semantic-radius-card)');
    expect(styles).toContain('border-radius: var(--cp-component-card-radius)');
    expect(tokens).toContain('--cp-semantic-duration-runway: var(--cp-primitive-duration-runway)');
    expect(styles).toContain('animation: cp-runway-frame var(--cp-semantic-duration-runway)');
    expect(tokens).toContain('--cp-component-commerce-explanation-color: var(--cp-semantic-color-status-copy)');
    expect(styles).toContain('color: var(--cp-component-commerce-explanation-color)');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('button:focus-visible');
    expect(styles).toContain('a:focus-visible');
  });

  it('locks the approved responsive commerce geometry to named component tokens', () => {
    const tokens = readFileSync(tokenPath, 'utf8');
    const styles = readFileSync(globalPath, 'utf8');

    expect(tokens).toContain('--cp-semantic-font-size-label-small: var(--cp-primitive-font-size-062)');
    expect(tokens).toContain('--cp-semantic-color-canvas-deep: var(--cp-primitive-color-neutral-025)');
    expect(tokens).toContain('--cp-component-commerce-page-background: var(--cp-semantic-color-canvas-deep)');
    expect(tokens).toContain('--cp-component-product-detail-page-background: var(--cp-semantic-color-canvas)');
    expect(tokens).toContain('--cp-component-product-runway-scroll-margin: var(--cp-semantic-size-header)');
    expect(tokens).toContain('--cp-component-commerce-header-outer-height: calc(var(--cp-semantic-size-header) + var(--cp-semantic-size-hairline))');
    expect(tokens).toContain('--cp-component-product-detail-title-size: var(--cp-semantic-font-size-product-detail-mobile)');
    expect(tokens).toContain('--cp-component-commerce-title-line-height: var(--cp-semantic-font-line-height-section)');
    expect(tokens).toContain('--cp-component-bag-panel-padding: var(--cp-semantic-space-7)');
    expect(tokens).toContain('--cp-component-bag-definition-line-height: var(--cp-semantic-font-line-height-control)');
    expect(tokens).toContain('--cp-component-bag-description-line-height: var(--cp-semantic-font-line-height-commerce-body-mobile)');
    expect(styles).toContain('scroll-margin-top: var(--cp-component-product-runway-scroll-margin)');
    expect(selectorDeclarations('.cp-commerce-page').background).toBe('var(--cp-component-commerce-page-background)');
    expect(selectorDeclarations('.cp-product-detail-page').background).toBe('var(--cp-component-product-detail-page-background)');
    expect(styles).toContain('height: var(--cp-component-commerce-header-outer-height)');
    expect(styles).toContain('font-size: var(--cp-component-product-detail-title-size)');
    expect(styles).toContain('line-height: var(--cp-component-commerce-title-line-height)');
  });

  it('separates every measured parity role through primitive, semantic, and component tiers', () => {
    const tokens = readFileSync(tokenPath, 'utf8');
    const values = tokenValues();

    for (const contract of [
      '--cp-semantic-font-size-product-fact: var(--cp-primitive-font-size-050)',
      '--cp-component-product-fact-font-size: var(--cp-semantic-font-size-product-fact)',
      '--cp-semantic-font-size-action: var(--cp-primitive-font-size-062)',
      '--cp-component-action-font-size: var(--cp-semantic-font-size-action)',
      '--cp-component-action-line-height: var(--cp-semantic-font-line-height-action)',
      '--cp-component-action-letter-spacing: var(--cp-semantic-font-tracking-action)',
      '--cp-semantic-font-size-card-label: var(--cp-primitive-font-size-056)',
      '--cp-component-card-label-font-size: var(--cp-semantic-font-size-card-label)',
      '--cp-component-card-label-line-height: var(--cp-semantic-font-line-height-card-label)',
      '--cp-component-card-title-letter-spacing: var(--cp-semantic-font-tracking-card-title)',
      '--cp-component-card-action-height: var(--cp-semantic-size-card-action)',
      '--cp-component-product-detail-price-line-height: var(--cp-semantic-font-line-height-price)',
      '--cp-component-checkout-label-letter-spacing: var(--cp-semantic-font-tracking-action)',
      '--cp-component-checkout-explanation-line-height: var(--cp-semantic-font-line-height-commerce-body-mobile)',
      '--cp-component-information-title-letter-spacing: var(--cp-semantic-font-tracking-information-title)',
      '--cp-component-editorial-title-letter-spacing: var(--cp-semantic-font-tracking-editorial-title)',
      '--cp-component-information-copy-font-size: var(--cp-semantic-font-size-information-copy)',
      '--cp-component-information-copy-line-height: var(--cp-semantic-font-line-height-information-copy)',
      '--cp-component-information-section-padding: var(--cp-semantic-space-20)',
      '--cp-component-editorial-title-max-width: var(--cp-semantic-size-copy-editorial)',
    ]) expect(tokens).toContain(contract);

    expect(firstTokenValue(values, '--cp-primitive-font-size-050')).toBe('0.5rem');
    expect(firstTokenValue(values, '--cp-primitive-font-line-height-action')).toBe('0.9375rem');
    expect(firstTokenValue(values, '--cp-primitive-font-line-height-card-label')).toBe('0.84375rem');
    expect(firstTokenValue(values, '--cp-primitive-font-line-height-commerce-body-mobile')).toBe('1.625');
    expect(firstTokenValue(values, '--cp-primitive-font-line-height-commerce-body')).toBe('1.75rem');
    expect(firstTokenValue(values, '--cp-primitive-font-line-height-price')).toBe('2rem');

    expect(values.get('--cp-component-commerce-body-line-height')).toEqual([
      'var(--cp-semantic-font-line-height-commerce-body-mobile)',
      'var(--cp-semantic-font-line-height-commerce-body)',
    ]);
    expect(values.get('--cp-component-information-title-size')).toEqual([
      'var(--cp-semantic-font-size-information-title-mobile)',
      'var(--cp-semantic-font-size-information-title-tablet)',
    ]);
    expect(values.get('--cp-component-information-title-line-height')).toEqual([
      'var(--cp-semantic-font-line-height-information-title-mobile)',
      'var(--cp-semantic-font-line-height-information-title-tablet)',
    ]);
    expect(values.get('--cp-component-editorial-title-size')).toEqual([
      'var(--cp-semantic-font-size-editorial-title-mobile)',
      'var(--cp-semantic-font-size-editorial-title-tablet)',
      'var(--cp-semantic-font-size-editorial-title-desktop)',
      'var(--cp-semantic-font-size-editorial-title-wide)',
    ]);
    expect(values.get('--cp-component-information-section-padding')).toEqual([
      'var(--cp-semantic-space-20)',
      'var(--cp-semantic-space-28)',
    ]);
    expect(values.get('--cp-component-editorial-copy-font-size')).toEqual([
      'var(--cp-semantic-font-size-editorial-copy-mobile)',
      'var(--cp-semantic-font-size-editorial-copy-tablet)',
    ]);
    expect(values.get('--cp-component-editorial-copy-line-height')).toEqual([
      'var(--cp-semantic-font-line-height-editorial-copy-mobile)',
      'var(--cp-semantic-font-line-height-editorial-copy-tablet)',
    ]);
  });

  it('binds shared selectors to role tokens without recoupling unrelated labels, headings, or actions', () => {
    expect(selectorDeclarations('.cp-label-small')['font-size']).toBe('var(--cp-semantic-font-size-label-small)');
    expect(selectorDeclarations('.cp-product-facts li')['font-size']).toBe('var(--cp-component-product-fact-font-size)');
    expect(selectorDeclarations('.cp-card-copy > .cp-label-small')).toMatchObject({
      'font-size': 'var(--cp-component-card-label-font-size)',
      'line-height': 'var(--cp-component-card-label-line-height)',
    });
    expect(selectorDeclarations('.cp-action')).toMatchObject({
      'font-size': 'var(--cp-component-action-font-size)',
      'line-height': 'var(--cp-component-action-line-height)',
      'letter-spacing': 'var(--cp-component-action-letter-spacing)',
      'padding-inline': 'var(--cp-component-action-inline-padding)',
    });
    expect(selectorDeclarations('.cp-card-action')).toMatchObject({
      height: 'var(--cp-component-card-action-height)',
      'min-height': 'var(--cp-component-card-action-height)',
      'padding-inline': 'var(--cp-component-card-action-inline-padding)',
    });
    expect(selectorDeclarations('.cp-card-title')['letter-spacing']).toBe('var(--cp-component-card-title-letter-spacing)');
    expect(selectorDeclarations('.cp-product-detail-price')['line-height']).toBe('var(--cp-component-product-detail-price-line-height)');
    expect(selectorDeclarations('.cp-product-detail-description')['line-height']).toBe('var(--cp-component-commerce-body-line-height)');
    expect(selectorDeclarations('.cp-checkout-label')['letter-spacing']).toBe('var(--cp-component-checkout-label-letter-spacing)');
    expect(selectorDeclarations('.cp-checkout-explanation')['line-height']).toBe('var(--cp-component-checkout-explanation-line-height)');
    expect(selectorDeclarations('.cp-commerce-page .cp-information-title')).toMatchObject({
      'font-size': 'var(--cp-component-information-title-size)',
      'line-height': 'var(--cp-component-information-title-line-height)',
      'letter-spacing': 'var(--cp-component-information-title-letter-spacing)',
    });
    expect(selectorDeclarations('.cp-information-section')['padding-block']).toBe('var(--cp-component-information-section-padding)');
    expect(selectorDeclarations('.cp-information-copy')).toMatchObject({
      'font-size': 'var(--cp-component-information-copy-font-size)',
      'line-height': 'var(--cp-component-information-copy-line-height)',
    });
    expect(selectorDeclarations('.cp-commerce-page .cp-editorial-title')).toMatchObject({
      'max-width': 'var(--cp-component-editorial-title-max-width)',
      'font-size': 'var(--cp-component-editorial-title-size)',
      'line-height': 'var(--cp-component-editorial-title-line-height)',
      'letter-spacing': 'var(--cp-component-editorial-title-letter-spacing)',
    });
    expect(selectorDeclarations('.cp-editorial-copy')).toMatchObject({
      'font-size': 'var(--cp-component-editorial-copy-font-size)',
      'line-height': 'var(--cp-component-editorial-copy-line-height)',
    });
  });

  it('keeps the production composition contract and exact supplied runway asset', () => {
    const home = readFileSync('components/storefront/home-storefront.jsx', 'utf8');
    const styles = readFileSync(globalPath, 'utf8');
    const digest = createHash('sha256')
      .update(readFileSync('public/campaigns/lofoten-runway-hero.png'))
      .digest('hex');

    expect(digest).toBe('2c42ff8fab50819522e7a6a8e48a51083e39b0e4fdbc41df13568446426ac338');
    for (const copy of ['At the edge of life', "displayName: 'ONE'", "'Black'", "'XS–5XL'", "'Heavyweight fleece'", "'CP embroidery'"]) {
      expect(home).toContain(copy);
    }
    expect(home).toContain('cp-product-layout cp-page-shell');
    expect(home).toContain('cp-product-media-button cp-product-media-button-corner');
    expect(home).toContain('aria-controls="site-menu-overlay"');
    expect(home).toContain('aria-expanded={menuOpen}');
    expect(home).toContain('role="dialog"');
    expect(home).toContain('aria-modal="true"');
    expect(home).toContain("classList.add('cp-scroll-locked')");
    expect(home).toContain("addEventListener('wheel', preventScroll, { passive: false })");
    expect(home).toContain("removeEventListener('wheel', preventScroll)");
    expect(home).toContain('moveDialogFocus(event, dialog)');
    expect(styles).toContain('html.cp-scroll-locked');
    expect(home).toContain("event.key === 'Escape'");
    expect(home).toContain('menuButtonRef.current?.focus()');
    expect(home).toContain('inert={menuOpen || mediaOpen ? true : undefined}');
    expect(styles).toContain('.cp-product-layout');
    expect(styles).toContain('justify-content: var(--cp-semantic-layout-justify-end)');
    expect(styles).toContain('transform: translateY(var(--cp-component-product-copy-offset))');
    expect(styles).toContain('padding: var(--cp-semantic-space-media-panel-inset)');
    expect(home).not.toContain('Product attributes');
    expect(home).not.toContain('Structured fleece');
    expect(home).not.toContain('11 views');
  });

  it('removes only the proven unused UI scaffold and its direct dependency set', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const removedPaths = [
      'components.json',
      'components/ui',
      'hooks/use-mobile.jsx',
      'hooks/use-toast.js',
      'lib/utils.js',
      'tailwind.config.js',
    ];
    const removedDependencies = [
      '@hookform/resolvers', '@radix-ui/react-dialog', '@tanstack/react-table',
      'class-variance-authority', 'clsx', 'cmdk', 'framer-motion', 'react-hook-form',
      'recharts', 'sonner', 'tailwind-merge', 'tailwindcss', 'vaul', 'zod',
    ];

    for (const path of removedPaths) expect(existsSync(path), path).toBe(false);
    for (const dependency of removedDependencies) expect(packageJson.dependencies).not.toHaveProperty(dependency);

    const activeSource = activeCustomerFiles.map(file => readFileSync(file, 'utf8')).join('\n');
    const selectors = new Set([...readFileSync(globalPath, 'utf8').matchAll(/\.(cp-[a-z0-9-]+)/g)].map(match => match[1]));
    const referencedClasses = new Set([...activeSource.matchAll(/\b(cp-[a-z0-9-]+)\b/g)].map(match => match[1]));
    expect([...selectors].filter(selector => !referencedClasses.has(selector))).toEqual([]);
    expect(activeSource).not.toMatch(/components\/ui|hooks\/use-(?:mobile|toast)|lib\/utils/);
  });

  it('keeps customer-facing route metadata provider-neutral', () => {
    const sources = [
      readFileSync('app/layout.js', 'utf8'),
      readFileSync('app/shop/page.js', 'utf8'),
      readFileSync('app/products/[handle]/page.js', 'utf8'),
    ].join('\n');
    expect(sources).not.toMatch(/description:\s*['"][^'"\n]*shopify/i);
  });
});
