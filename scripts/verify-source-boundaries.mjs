import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

function files(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

const shipped = files('apps/web/src').filter((file) =>
  /\.(?:ts|tsx)$/.test(file)
);
const forbidden = [];
for (const file of shipped) {
  const source = readFileSync(file, 'utf8');
  if (/from\s+['\"](?:\.\.\/){3,}lib\//.test(source)) forbidden.push(file);
}
if (forbidden.length) {
  console.error('Shipped code imports the root tooling tree:');
  for (const file of forbidden) console.error(`- ${relative('.', file)}`);
  process.exit(1);
}

const rootModules = new Set(
  files('lib')
    .filter((file) => file.endsWith('.js'))
    .map((file) => relative('lib', file).replace(/\.js$/, ''))
);
const duplicates = files('apps/web/src/lib')
  .filter((file) => file.endsWith('.ts'))
  .map((file) => relative('apps/web/src/lib', file).replace(/\.ts$/, ''))
  .filter((module) => rootModules.has(module))
  .sort();

console.log(
  `Source boundary passed: shipped code has no root-lib imports; ${duplicates.length} historical same-path tooling/runtime pairs are mapped and may not cross the boundary.`
);
