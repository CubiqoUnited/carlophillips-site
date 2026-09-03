import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const shippedRoot = join(root, 'apps/web/src');
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
const violations = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (extensions.has(extname(path))) inspect(path);
  }
}

function inspect(path) {
  const source = readFileSync(path, 'utf8');
  const checks = [
    [
      /gid:\/\/shopify\/(?:Product|ProductVariant)\/\d+/g,
      'HARDCODED_SHOPIFY_GID',
    ],
    [/["'`]\/api\/checkout["'`]/g, 'LEGACY_CHECKOUT_ROUTE'],
    [
      /(?:from|import\s*\()\s*["'`][^"'`]*(?:resend|order-confirmation|notifications\/email)[^"'`]*["'`]/gi,
      'CUSTOM_ORDER_EMAIL_IMPORT',
    ],
  ];
  for (const [pattern, code] of checks) {
    if (pattern.test(source))
      violations.push(`${code}:${relative(root, path)}`);
  }
}

walk(shippedRoot);
if (violations.length) {
  process.stderr.write(`${violations.sort().join('\n')}\n`);
  process.exit(1);
}
process.stdout.write('Commerce contract verified for shipped runtime.\n');
