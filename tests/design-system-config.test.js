import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const visualConfig = require('../packages/config/eslint-visual.cjs');
const tailwind = require('../packages/config/tailwind.cjs');

function filesBelow(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });
}

describe('design-system control room', () => {
  it('publishes only token-backed Tailwind visual scales', () => {
    expect(tailwind.theme.extend).toBeUndefined();
    expect(tailwind.theme.spacing['11']).toBeUndefined();
    expect(tailwind.theme.fontSize['3xl']).toBeUndefined();
    expect(tailwind.theme.spacing['7']).toBe('var(--cp-space-7)');
    expect(tailwind.theme.fontSize['2xl']).toBe('var(--cp-size-copy-2xl)');
    expect(tailwind.theme.spacing['8']).toBe('var(--cp-space-8)');
    expect(tailwind.theme.fontSize.section).toBe(
      'var(--cp-size-heading-section)'
    );
  });

  it('rejects visual literals and bypass imports in primitive JSX', () => {
    const linter = new Linter();
    const verify = (source) =>
      linter.verify(source, {
        ...visualConfig,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
        },
      });

    expect(
      verify('export const A = () => <div className="mt-11" />')
    ).not.toEqual([]);
    expect(
      verify('export const A = () => <div className="text-3xl" />')
    ).not.toEqual([]);
    expect(
      verify('export const A = () => <div className="mt-7 text-2xl" />')
    ).toEqual([]);
    expect(
      verify('export const A = () => <div style={{ padding: 8 }} />')
    ).not.toEqual([]);
    expect(
      verify("import { Button } from '@/components/ui/button';")
    ).not.toEqual([]);
    expect(
      verify('export const A = () => <div className="cp-story-stack" />')
    ).toEqual([]);
  });

  it('covers every active static Tailwind visual key with a token mapping', () => {
    const source = filesBelow('apps/web/src')
      .filter((file) => /\.(?:js|jsx|ts|tsx)$/.test(file))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    const classes = [...source.matchAll(/className\s*=\s*["']([^"']+)["']/g)]
      .flatMap((match) => match[1].split(/\s+/))
      .map((className) => className.split(':').at(-1));

    const assertMapped = (scale, prefix, values) => {
      for (const className of classes) {
        const match = className.match(prefix);
        if (
          !match ||
          match[1].startsWith('[') ||
          (values && !values.has(match[1]))
        )
          continue;
        expect(
          tailwind.theme[scale][match[1]],
          `${className} must map through theme.${scale}`
        ).toMatch(/^var\(--cp-/);
      }
    };

    assertMapped(
      'spacing',
      /^(?:m[trblxy]?|p[trblxy]?|gap|space-[xy])-(.+)$/,
      null
    );
    assertMapped(
      'height',
      /^h-(.+)$/,
      new Set(['4', '5', '12', '14', '16', 'full'])
    );
    assertMapped(
      'minHeight',
      /^min-h-(.+)$/,
      new Set(['14', '16', '32', 'screen'])
    );
    assertMapped(
      'maxWidth',
      /^max-w-(.+)$/,
      new Set(['xl', '2xl', '3xl', '4xl', '5xl'])
    );
    assertMapped(
      'fontSize',
      /^text-(.+)$/,
      new Set(['xs', 'sm', 'base', 'xl', '2xl'])
    );
    assertMapped('width', /^w-(.+)$/, new Set(['full']));
    expect(tailwind.theme.fontWeight.light).toBe('var(--cp-weight-light)');
    expect(tailwind.theme.lineHeight.relaxed).toBe('var(--cp-leading-relaxed)');
  });

  it('keeps primitive CSS free of raw colours and dimensional declarations', () => {
    const styles = readFileSync(
      'packages/design-system/styles/globals.css',
      'utf8'
    );
    expect(styles).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);

    const dimensionalDeclaration =
      /^\s*(?:border-radius|font-size|gap|height|margin(?:-[a-z]+)?|max-(?:height|width)|min-(?:height|width)|padding(?:-[a-z]+)?|width):[^;]*(?:\d*\.)?\d+(?:px|rem|em|vh|vw|svh)\b/m;
    expect(styles).not.toMatch(dimensionalDeclaration);
  });

  it('pins Yarn Classic-compatible Storybook and covers every primitive', () => {
    const packageDocument = JSON.parse(
      readFileSync('packages/design-system/package.json', 'utf8')
    );
    for (const dependency of [
      'storybook',
      '@storybook/react-vite',
      '@storybook/addon-essentials',
      '@storybook/addon-a11y',
    ]) {
      expect(packageDocument.devDependencies[dependency]).toBe('8.6.18');
    }
    for (const primitive of ['Button', 'Text', 'Media', 'Layout']) {
      expect(
        readFileSync(
          `packages/design-system/components/${primitive}/${primitive}.stories.tsx`,
          'utf8'
        )
      ).toContain(`Primitives/${primitive}`);
    }
  });
});
