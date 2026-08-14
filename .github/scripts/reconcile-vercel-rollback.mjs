import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const PRODUCTION_DOMAINS = ['carlophillips.com', 'www.carlophillips.com'];

function parseArguments(values) {
  const [mode, ...rest] = values;
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index];
    const value = rest[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument near ${key || '<missing>'}`);
    }
    options[key.slice(2)] = value;
  }
  return { mode, options };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function requireProductionIdentity(deployment, subject) {
  requireValue(/^dpl_[A-Za-z0-9]+$/.test(deployment?.id || ''), `${subject} lacks a valid deployment ID.`);
  requireValue(deployment?.target === 'production', `${subject} is not a Production deployment.`);
}

function requireReadyProduction(deployment, subject) {
  requireProductionIdentity(deployment, subject);
  requireValue(deployment?.readyState === 'READY', `${subject} is not READY.`);
}

const { mode, options } = parseArguments(process.argv.slice(2));
const productionBefore = readJson(options['production-before']);
requireReadyProduction(productionBefore, 'Rollback anchor');
requireValue(Boolean(options.output), 'Output receipt path is required.');

if (mode === 'plan') {
  const productionCurrent = readJson(options['production-current']);
  requireProductionIdentity(productionCurrent, 'Current Production');
  requireValue(Boolean(options['github-output']), 'GitHub output path is required.');

  const rollbackRequired = productionCurrent.id !== productionBefore.id;
  const receipt = {
    schemaVersion: 'cp.vercel-rollback-plan.v1',
    rollbackDeploymentId: productionBefore.id,
    currentDeploymentId: productionCurrent.id,
    rollbackRequired,
  };
  writeFileSync(options.output, `${JSON.stringify(receipt, null, 2)}\n`);
  appendFileSync(
    options['github-output'],
    `rollback_required=${String(rollbackRequired)}\nrollback_deployment_id=${productionBefore.id}\n`,
  );
} else if (mode === 'verify') {
  const productionAfter = readJson(options['production-after']);
  requireReadyProduction(productionAfter, 'Production after rollback reconciliation');
  requireValue(
    productionAfter.id === productionBefore.id,
    'Rollback reconciliation did not restore the captured Production deployment.',
  );
  const aliases = new Set(Array.isArray(productionAfter.aliases) ? productionAfter.aliases : []);
  for (const domain of PRODUCTION_DOMAINS) {
    requireValue(aliases.has(domain), `Rollback reconciliation is missing the ${domain} alias.`);
  }

  writeFileSync(options.output, `${JSON.stringify({
    schemaVersion: 'cp.vercel-rollback-receipt.v1',
    restoredDeploymentId: productionAfter.id,
    readyState: productionAfter.readyState,
    productionAliases: PRODUCTION_DOMAINS,
  }, null, 2)}\n`);
} else {
  throw new Error(`Unknown rollback mode: ${mode || '<missing>'}`);
}
