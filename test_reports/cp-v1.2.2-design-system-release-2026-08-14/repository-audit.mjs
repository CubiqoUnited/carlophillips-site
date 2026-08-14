import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const evidenceRoot = 'test_reports/cp-v1.2.2-design-system-release-2026-08-14';
const gitFiles = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'])
  .toString()
  .split('\0')
  .filter(file => file && existsSync(file) && statSync(file).isFile());
const codeFiles = gitFiles.filter(file => /^(?:app|components|fixtures|lib|hooks)\/.+\.(?:js|jsx|ts|tsx)$/.test(file));

const secretPatterns = {
  awsAccessKey: /AKIA[0-9A-Z]{16}/g,
  githubToken: /(?:ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,}/g,
  privateKey: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  shopifySecret: /(?:shpat|shpss|shpca|shppa)_[A-Za-z0-9]{20,}/g,
  slackToken: /xox[baprs]-[A-Za-z0-9-]{20,}/g,
  stripeSecret: /sk_(?:live|test)_[A-Za-z0-9]{16,}/g,
};
const secretMatches = [];
for (const file of gitFiles) {
  const buffer = readFileSync(file);
  if (buffer.includes(0)) continue;
  const source = buffer.toString('utf8');
  for (const [kind, pattern] of Object.entries(secretPatterns)) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) secretMatches.push({ file, kind });
  }
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const dependencyUsage = Object.fromEntries(Object.keys(packageJson.dependencies).map(dependency => [dependency, []]));
for (const file of codeFiles) {
  const source = readFileSync(file, 'utf8');
  for (const dependency of Object.keys(dependencyUsage)) {
    const escaped = dependency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`["']${escaped}(?:[\\/"'])`).test(source)) dependencyUsage[dependency].push(file);
  }
}
if (dependencyUsage['react-dom'].length === 0) {
  dependencyUsage['react-dom'].push('framework runtime peer required by Next.js and React');
}

const digests = new Map();
for (const file of codeFiles) {
  const digest = createHash('sha256').update(readFileSync(file)).digest('hex');
  if (!digests.has(digest)) digests.set(digest, []);
  digests.get(digest).push(file);
}
const exactDuplicateCode = [...digests.values()].filter(files => files.length > 1);
const deletedPaths = execFileSync('git', ['diff', '--name-only', '--diff-filter=D'])
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);
const activeSource = codeFiles.map(file => readFileSync(file, 'utf8')).join('\n');
const removedReferencePatterns = [
  'components/ui/',
  'hooks/use-mobile',
  'hooks/use-toast',
  'lib/utils',
  'tailwindcss',
];
const removedReferences = removedReferencePatterns.filter(pattern => activeSource.includes(pattern));
const tokenSource = readFileSync('app/design-tokens.css', 'utf8');
const tokenNames = [...new Set([...tokenSource.matchAll(/(--cp-(?:primitive|semantic|component)-[a-z0-9-]+)\s*:/g)].map(match => match[1]))];

const report = {
  schemaVersion: 'cp.repository-audit.v1',
  date: '2026-08-14',
  inventory: {
    trackedAndCandidateFiles: gitFiles.length,
    activeCodeFiles: codeFiles.length,
    deletedPaths: deletedPaths.length,
    deletedUiScaffoldFiles: deletedPaths.filter(file => file.startsWith('components/ui/')).length,
  },
  designTokens: {
    total: tokenNames.length,
    primitive: tokenNames.filter(name => name.startsWith('--cp-primitive-')).length,
    semantic: tokenNames.filter(name => name.startsWith('--cp-semantic-')).length,
    component: tokenNames.filter(name => name.startsWith('--cp-component-')).length,
  },
  dependencies: {
    runtimeCount: Object.keys(packageJson.dependencies).length,
    usage: dependencyUsage,
    unusedRuntimeDependencies: Object.entries(dependencyUsage).filter(([, files]) => files.length === 0).map(([dependency]) => dependency),
  },
  cleanup: {
    removedReferences,
    exactDuplicateCode,
  },
  secrets: {
    scannedFiles: gitFiles.length,
    strongPatternMatchCount: secretMatches.length,
    matchesRedactedToFileAndKind: secretMatches,
    trackedEnvironmentFiles: gitFiles.filter(file => /(^|\/)\.env(?:\.|$)/.test(file)),
  },
};

writeFileSync(`${evidenceRoot}/repository-audit.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
