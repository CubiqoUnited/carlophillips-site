import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateProductionCommercePreflight } from '../lib/releases/production-commerce-preflight.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELEASE_PATTERN = /^cp-[a-z0-9-]+$/;

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

const decision = evaluateProductionCommercePreflight({
  releaseRecord,
  mediaManifest: readJson(mediaManifestPath),
  expectedSha,
  capabilityRegistry: readJson(resolveInsideRoot('config/capability-registry.json')),
  cartAuthorization: readJson(resolveInsideRoot('config/shopify-cart-activation-authorization.json')),
  checkoutAuthorization: readJson(resolveInsideRoot('config/shopify-checkout-authorization.json')),
});

process.stdout.write(`${JSON.stringify(decision, null, 2)}\n`);
if (!decision.ready) process.exitCode = 1;
