import { lstatSync, readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateEvidenceOnlyDescendant } from '../lib/releases/evidence-only-descendant.js';
import { evaluateProductionCommercePreflight } from '../lib/releases/production-commerce-preflight.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELEASE_PATTERN = /^cp-[a-z0-9-]+$/;
const COMMIT_PATTERN = /^[a-f0-9]{40}$/;

function parseArguments(values) {
  const options = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument near ${key || '<missing>'}`);
    }
    options[key.slice(2)] = value;
  }
  return options;
}

function readJson(filePath) {
  if (lstatSync(filePath).isSymbolicLink()) {
    throw new Error(`Symlinked release input is forbidden: ${path.relative(ROOT, filePath)}`);
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function resolveInsideRoot(reference) {
  const resolved = path.resolve(ROOT, reference);
  const relative = path.relative(ROOT, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Release input escapes the repository: ${reference}`);
  }
  return resolved;
}

function commitExists(sha) {
  const result = spawnSync('git', ['cat-file', '-e', `${sha}^{commit}`], {
    cwd: ROOT,
    stdio: 'ignore',
  });
  return result.status === 0;
}

function collectSourceRelationship({ releaseId, candidateSha, expectedSha }) {
  const candidateExists = COMMIT_PATTERN.test(candidateSha || '') && commitExists(candidateSha);
  const expectedExists = COMMIT_PATTERN.test(expectedSha || '') && commitExists(expectedSha);
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  let candidateIsAncestor = false;
  let changedPaths = [];
  let symlinkPaths = [];

  if (candidateExists && expectedExists) {
    candidateIsAncestor = spawnSync(
      'git',
      ['merge-base', '--is-ancestor', candidateSha, expectedSha],
      { cwd: ROOT, stdio: 'ignore' },
    ).status === 0;

    if (candidateIsAncestor) {
      const changed = execFileSync(
        'git',
        ['diff', '--no-renames', '--name-only', '--diff-filter=ACDMRTUXB', '-z', candidateSha, expectedSha],
        { cwd: ROOT },
      );
      changedPaths = changed.toString('utf8').split('\0').filter(Boolean);

      if (changedPaths.length) {
        const tree = execFileSync(
          'git',
          ['ls-tree', '-rz', expectedSha, '--', ...changedPaths],
          { cwd: ROOT },
        ).toString('utf8');
        symlinkPaths = tree.split('\0').filter(Boolean).flatMap(entry => {
          const match = entry.match(/^120000 blob [a-f0-9]+\t(.+)$/);
          return match ? [match[1]] : [];
        });
      }
    }
  }

  return evaluateEvidenceOnlyDescendant({
    releaseId,
    candidateSha,
    expectedSha,
    candidateExists,
    expectedExists,
    expectedIsHead: head === expectedSha,
    candidateIsAncestor,
    changedPaths,
    symlinkPaths,
  });
}

const options = parseArguments(process.argv.slice(2));
const releaseId = options.release;
const expectedSha = options['expected-sha'];
if (!RELEASE_PATTERN.test(releaseId || '')) {
  throw new Error('Release identifier is invalid.');
}

const releasePath = resolveInsideRoot(`releases/${releaseId}/release.json`);
const releaseRecord = readJson(releasePath);
if (releaseRecord.releaseId !== releaseId) {
  throw new Error('Release file identity does not match the selected release.');
}
const mediaManifestPath = resolveInsideRoot(releaseRecord.mediaManifest || '');
const releaseDirectory = path.dirname(releasePath);
const mediaRelative = path.relative(releaseDirectory, mediaManifestPath);
if (!mediaRelative || mediaRelative.startsWith('..') || path.isAbsolute(mediaRelative)) {
  throw new Error('Media manifest must be contained by the selected release directory.');
}

const sourceRelationship = collectSourceRelationship({
  releaseId,
  candidateSha: releaseRecord.candidate?.gitCommit,
  expectedSha,
});

const decision = evaluateProductionCommercePreflight({
  releaseRecord,
  mediaManifest: readJson(mediaManifestPath),
  expectedSha,
  sourceRelationship,
  capabilityRegistry: readJson(resolveInsideRoot('config/capability-registry.json')),
  cartAuthorization: readJson(resolveInsideRoot('config/shopify-cart-activation-authorization.json')),
  checkoutAuthorization: readJson(resolveInsideRoot('config/shopify-checkout-authorization.json')),
});

decision.sourceRelationship = sourceRelationship;

process.stdout.write(`${JSON.stringify(decision, null, 2)}\n`);
if (!decision.ready) process.exitCode = 1;
