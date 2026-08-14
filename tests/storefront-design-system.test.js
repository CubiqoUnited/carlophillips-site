import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : /\.(?:ts|tsx)$/.test(path)
        ? [path]
        : [];
  });
}

describe('storefront design system', () => {
  it('defines and consumes the CARLOPHILLIPS token hierarchy', () => {
    const tokens = readFileSync(
      'packages/design-system/styles/tokens.css',
      'utf8'
    );
    const styles = readFileSync(
      'packages/design-system/styles/globals.css',
      'utf8'
    );
    const appStyles = readFileSync('apps/web/src/app/globals.css', 'utf8');

    for (const token of [
      '--cp-color-neutral-000',
      '--cp-color-neutral-1000',
      '--cp-color-canvas',
      '--cp-color-ink',
      '--cp-color-copy-strong',
      '--cp-color-rule-focus',
      '--cp-font-sans',
      '--cp-font-editorial',
      '--cp-size-body-large',
      '--cp-space-24',
      '--cp-page-gutter',
      '--cp-section-space',
      '--cp-duration-standard',
      '--cp-radius-none',
      '--cp-touch-target-min',
      '--cp-layer-dialog',
      '--cp-component-card-radius',
    ]) {
      expect(tokens).toContain(token);
    }

    expect(styles.startsWith("@import './tokens.css';")).toBe(true);
    expect(appStyles.trim()).toBe("@import '@repo/design-system/styles';");
    expect(tokens).toContain('Tier 1 — primitive values');
    expect(tokens).toContain('Tier 2 — semantic intent');
    expect(tokens).toContain('Tier 3 — component aliases');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('scroll-snap-type: x mandatory');
    expect(styles).toContain('.cp-skip-link');
  });

  it('keeps active TSX customer surfaces free of raw visual escape hatches', () => {
    const customerFiles = sourceFiles('apps/web/src/components');
    customerFiles.push(
      'apps/web/src/app/layout.tsx',
      'apps/web/src/app/opengraph-image.tsx'
    );

    for (const file of customerFiles) {
      const source = readFileSync(file, 'utf8');
      expect(
        source,
        `${file} contains a raw visual colour utility`
      ).not.toMatch(
        /(?:bg|text|border|from|via|to)-(?:black|white)(?:\/\d+)?|(?:bg|text|border)-\[#[0-9a-f]+\]/i
      );
      expect(source, `${file} contains a one-off tracking value`).not.toMatch(
        /tracking-\[[^\]]+\]/
      );
      expect(source, `${file} contains a raw CSS colour`).not.toMatch(
        /#[0-9a-f]{3,8}\b|rgba?\(/i
      );
      if (file.endsWith('opengraph-image.tsx')) {
        expect(source).toContain('@repo/design-system/serialized-tokens');
      } else {
        expect(source, `${file} contains an inline JSX style`).not.toMatch(
          /\sstyle=\{\{/
        );
      }

      const arbitraryUtilities = source.match(/[a-z-]+-\[[^\]]+\]/g) || [];
      expect(
        arbitraryUtilities.filter(
          (value) =>
            !value.includes('var(--cp-') && !value.startsWith('object-[')
        ),
        `${file} contains un-tokenized arbitrary utilities`
      ).toEqual([]);
    }
  });

  it('keeps raw colours and lengths inside the canonical token source', () => {
    const tokens = readFileSync(
      'packages/design-system/styles/tokens.css',
      'utf8'
    );
    const styles = readFileSync(
      'packages/design-system/styles/globals.css',
      'utf8'
    );
    const documentation = readFileSync('docs/design-system.md', 'utf8');

    expect(tokens).toMatch(/--cp-color-neutral-000:\s*#[0-9a-f]{6}/i);
    expect(styles).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    expect(styles).not.toMatch(/var\(--cp-color-(?:neutral|channel)-/);
    expect(documentation).toContain(
      'packages/design-system/styles/tokens.css` is the only raw CP visual-value source'
    );
  });

  it('ships the small typed primitive set and its Storybook review surface', () => {
    const index = readFileSync('packages/design-system/index.ts', 'utf8');
    for (const primitive of ['Button', 'Text', 'MediaFrame', 'Layout']) {
      expect(index).toContain(primitive);
    }
    for (const file of [
      'packages/design-system/.storybook/main.ts',
      'packages/design-system/.storybook/preview.ts',
      'packages/design-system/components/ControlRoom.stories.tsx',
      'packages/design-system/components/Button/Button.stories.tsx',
      'packages/design-system/components/Text/Text.stories.tsx',
      'packages/design-system/components/Media/Media.stories.tsx',
      'packages/design-system/components/Layout/Layout.stories.tsx',
    ]) {
      expect(readFileSync(file, 'utf8')).not.toBe('');
    }
  });

  it('uses the exact approved Product Owner runway image from the app public root', () => {
    const digest = createHash('sha256')
      .update(
        readFileSync('apps/web/public/media/editorial/lofoten-runway-hero.png')
      )
      .digest('hex');

    expect(digest).toBe(
      '2c42ff8fab50819522e7a6a8e48a51083e39b0e4fdbc41df13568446426ac338'
    );
  });

  it('keeps customer route metadata provider-neutral and Draft-safe', () => {
    const sources = [
      readFileSync('apps/web/src/app/layout.tsx', 'utf8'),
      readFileSync('apps/web/src/app/shop/page.tsx', 'utf8'),
      readFileSync('apps/web/src/app/product/[handle]/page.tsx', 'utf8'),
    ].join('\n');

    expect(sources).not.toMatch(/description:\s*['"][^'"\n]*shopify/i);
    expect(sources).not.toMatch(/description:\s*['"][^'"\n]*checkout/i);
    expect(sources).toContain('robots: { index: false, follow: false }');
  });
});
