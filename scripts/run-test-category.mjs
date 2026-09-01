import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

function files(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

const category = process.argv[2];
const tests = files('tests').filter(
  (file) => /\.test\.(?:js|jsx|ts|tsx)$/.test(file) && !file.includes('/e2e/')
);
const groups = { shipped: [], tooling: [], contracts: [] };
for (const file of tests) {
  const source = readFileSync(file, 'utf8');
  const shipped = /(?:apps\/web\/src|from ['\"]@\/|from ['\"]\.\.\/app\/)/.test(
    source
  );
  const tooling = /from ['\"](?:\.\.\/)+lib\//.test(source);
  if (shipped) groups.shipped.push(file);
  else if (tooling) groups.tooling.push(file);
  else groups.contracts.push(file);
}
if (!(category in groups)) {
  console.error(`Unknown test category: ${category}`);
  process.exit(2);
}
const selected = groups[category];
console.log(
  `Running ${category} tests: ${selected.length} files (shipped=${groups.shipped.length}, tooling=${groups.tooling.length}, contracts=${groups.contracts.length})`
);
const result = spawnSync('yarn', ['vitest', 'run', ...selected], {
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
