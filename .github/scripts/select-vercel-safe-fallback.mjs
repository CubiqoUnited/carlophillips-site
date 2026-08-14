import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const DEPLOYMENT_ID = /^dpl_[A-Za-z0-9]+$/;

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

function readJson(path) {
  if (!path) throw new Error('A required JSON input path is missing.');
  return JSON.parse(readFileSync(path, 'utf8'));
}

function aliases(deployment = {}) {
  if (Array.isArray(deployment.aliases)) return deployment.aliases;
  if (Array.isArray(deployment.alias)) return deployment.alias;
  return [];
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function requireDeployment(deployment, subject, { ready = false } = {}) {
  requireValue(DEPLOYMENT_ID.test(deployment?.id || ''), `${subject} lacks a valid deployment ID.`);
  requireValue(deployment?.target === 'production', `${subject} is not a Production deployment.`);
  if (ready) requireValue(deployment?.readyState === 'READY', `${subject} is not READY.`);
}

const options = parseArguments(process.argv.slice(2));
const productionAnchor = readJson(options['production-anchor']);
const safeFallback = readJson(options['safe-fallback']);
const productionCurrent = readJson(options['production-current']);
requireValue(Boolean(options.output), 'Output receipt path is required.');
requireValue(Boolean(options['github-output']), 'GitHub output path is required.');

requireDeployment(productionAnchor, 'Production drift anchor', { ready: true });
requireDeployment(safeFallback, 'Safe fallback', { ready: true });
requireDeployment(productionCurrent, 'Current Production');
requireValue(aliases(safeFallback).length === 0, 'Safe fallback must remain unaliased before recovery.');
requireValue(
  safeFallback.id !== productionAnchor.id,
  'Current Production drift anchor cannot be selected as the safe fallback.',
);

const currentPromotionSource = productionCurrent?.meta?.originalDeploymentId
  || productionCurrent?.originalDeploymentId
  || null;
const fallbackAlreadyActive = productionCurrent.id === safeFallback.id
  || currentPromotionSource === safeFallback.id;
const receipt = {
  schemaVersion: 'cp.vercel-safe-fallback-plan.v1',
  productionAnchorDeploymentId: productionAnchor.id,
  currentProductionDeploymentId: productionCurrent.id,
  safeFallbackDeploymentId: safeFallback.id,
  fallbackAlreadyActive,
  recoveryRequired: !fallbackAlreadyActive,
};

writeFileSync(options.output, `${JSON.stringify(receipt, null, 2)}\n`);
appendFileSync(
  options['github-output'],
  `recovery_required=${String(!fallbackAlreadyActive)}\nsafe_fallback_deployment_id=${safeFallback.id}\n`,
);
