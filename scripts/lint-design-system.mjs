import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const sourceRoots = [
  'app',
  'components',
  'apps/web/src/app',
  'apps/web/src/components',
  'packages/design-system/components',
];
const authorities = new Set([
  'app/design-tokens.css',
  'app/opengraph-image.js',
  'apps/web/src/app/opengraph-image.tsx',
]);
const extensions = /\.(?:css|js|jsx|ts|tsx)$/;
const violations = [];
const governedProperty = String.raw`(?:background(?:-color)?|border(?:-[a-z]+)?|box-shadow|text-shadow|color|filter|backdrop-filter|opacity|transform|text-transform|font(?:-[a-z]+)?|line-height|letter-spacing|border-radius|(?:margin|padding|gap|row-gap|column-gap)(?:-[a-z]+)?)`;

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return extensions.test(entry.name) ? [target] : [];
  });
}

for (const file of sourceRoots.flatMap(sourceFiles).filter(file => !authorities.has(file))) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/#[0-9a-f]{3,8}\b|(?:rgb|hsl)a?\(/gi)) {
    violations.push(`${file}:${source.slice(0, match.index).split('\n').length}: raw color literal`);
  }
  for (const [index, line] of source.split('\n').entries()) {
    const declaration = line.match(new RegExp(String.raw`^\s*${governedProperty}:\s*([^;]+);\s*$`));
    if (declaration && !declaration[1].includes('var(--cp-')) {
      violations.push(`${file}:${index + 1}: governed CSS value must use a --cp token`);
    }
  }
  for (const match of source.matchAll(/style=\{\{([\s\S]*?)\}\}/g)) {
    if (!match[1].includes("'--cp-") && !match[1].includes('"--cp-')) {
      violations.push(`${file}:${source.slice(0, match.index).split('\n').length}: inline styles must expose only --cp custom properties`);
    }
  }
}

if (violations.length) {
  console.error(`Design-system lint failed:\n${violations.join('\n')}`);
  process.exit(1);
}

console.log('Design-system lint passed: active UI values use canonical tokens and components.');
