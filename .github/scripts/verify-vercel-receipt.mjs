import { readFileSync, writeFileSync } from 'node:fs';

const PRODUCTION_DOMAINS = new Set(['carlophillips.com', 'www.carlophillips.com']);

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

function deploymentUrl(value) {
  return String(value || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function deploymentAliases(deployment = {}) {
  const values = Array.isArray(deployment.aliases) ? deployment.aliases : [];
  return values.map(deploymentUrl);
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function metadataSha(metadata = {}) {
  return metadata.cpGitCommitSha || metadata.gitCommitSha || metadata.githubCommitSha || null;
}

function findListedDeployment(list, inspect) {
  const expectedUrl = deploymentUrl(inspect.url);
  return list.deployments?.find(deployment => deploymentUrl(deployment.url) === expectedUrl) || null;
}

function verifyMetadata(metadata, expectedSha, expectedRelease, subject) {
  requireValue(metadataSha(metadata) === expectedSha, `${subject} metadata SHA does not match current canonical main.`);
  requireValue(metadata?.cpRelease === expectedRelease, `${subject} release metadata does not match the requested release.`);
  requireValue(metadata?.cpArtifactKind === 'staged-production', `${subject} lacks the staged Production artifact marker.`);
  requireValue(metadata?.cpBuildEnvironment === 'production', `${subject} was not built with Production semantics.`);
  requireValue(metadata?.cpCheckoutEnabled === 'false', `${subject} lacks the required fail-closed checkout marker.`);
}

function verifyCandidate({
  inspect,
  list,
  productionBefore,
  productionAfter,
  expectedSha,
  expectedRelease,
  expectedProductionAnchor = null,
}) {
  requireValue(inspect.readyState === 'READY', 'Selected candidate is not READY.');
  requireValue(inspect.target === 'production', 'Selected candidate is not a Production-target deployment.');

  const aliases = deploymentAliases(inspect);
  requireValue(
    aliases.length === 0,
    'Selected candidate already has a domain alias.',
  );

  const listed = findListedDeployment(list, inspect);
  requireValue(listed, 'Selected candidate is absent from the linked Vercel project deployment list.');
  requireValue(listed.target === 'production', 'Listed candidate is not Production-targeted.');
  requireValue((listed.readyState || listed.state) === 'READY', 'Listed candidate is not READY.');
  verifyMetadata(listed.meta, expectedSha, expectedRelease, 'Candidate');

  requireValue(productionBefore.readyState === 'READY', 'Captured Production rollback anchor is not READY.');
  requireValue(productionBefore.target === 'production', 'Captured rollback anchor is not a Production deployment.');
  const rollbackAliases = new Set(deploymentAliases(productionBefore));
  for (const domain of PRODUCTION_DOMAINS) {
    requireValue(rollbackAliases.has(domain), `Captured rollback anchor is missing the ${domain} alias.`);
  }
  if (expectedProductionAnchor) {
    requireValue(
      productionBefore.id === expectedProductionAnchor,
      'Current Production does not match the reviewed candidate receipt rollback anchor.',
    );
  }
  requireValue(productionBefore.id !== inspect.id, 'Selected candidate is already the current Production deployment.');
  requireValue(
    productionAfter.id === productionBefore.id,
    'Current Production changed while the candidate was being staged or selected.',
  );
  requireValue(productionAfter.readyState === 'READY', 'Current Production is not READY after the drift check.');
  requireValue(productionAfter.target === 'production', 'Current Production lost its Production target.');
  const afterAliases = new Set(deploymentAliases(productionAfter));
  for (const domain of PRODUCTION_DOMAINS) {
    requireValue(afterAliases.has(domain), `Current Production is missing the ${domain} alias after the drift check.`);
  }

  return { inspect, listed, productionBefore };
}

const { mode, options } = parseArguments(process.argv.slice(2));
const expectedSha = options['expected-sha'];
const expectedRelease = options['expected-release'];
const expectedProductionAnchor = options['expected-production-anchor'] || null;
requireValue(/^[0-9a-f]{40}$/.test(expectedSha || ''), 'Expected SHA must be a full lowercase commit SHA.');
requireValue(Boolean(expectedRelease), 'Expected release is required.');
requireValue(Boolean(options.output), 'Output receipt path is required.');

const candidateInspect = readJson(options['candidate-inspect']);
const candidateList = readJson(options['candidate-list']);
const productionBefore = readJson(options['production-before']);

if (mode === 'candidate') {
  const productionAfter = readJson(options['production-after']);
  const verified = verifyCandidate({
    inspect: candidateInspect,
    list: candidateList,
    productionBefore,
    productionAfter,
    expectedSha,
    expectedRelease,
    expectedProductionAnchor,
  });

  writeFileSync(options.output, `${JSON.stringify({
    schemaVersion: 'cp.vercel-release-candidate-receipt.v1',
    deploymentId: verified.inspect.id,
    deploymentUrl: verified.inspect.url,
    target: verified.inspect.target,
    readyState: verified.inspect.readyState,
    gitCommitSha: expectedSha,
    release: expectedRelease,
    artifactKind: 'staged-production',
    buildEnvironment: 'production',
    checkoutEnabled: false,
    productionDomainsAssigned: false,
    productionBeforeDeploymentId: verified.productionBefore.id,
    productionAfterStagingDeploymentId: productionAfter.id,
  }, null, 2)}\n`);
} else if (mode === 'production') {
  const productionAfter = readJson(options['production-after']);
  const productionList = readJson(options['production-list']);
  requireValue(
    /^dpl_[A-Za-z0-9]+$/.test(expectedProductionAnchor || ''),
    'Production verification requires the reviewed candidate receipt rollback anchor.',
  );
  verifyCandidate({
    inspect: candidateInspect,
    list: candidateList,
    productionBefore,
    productionAfter: productionBefore,
    expectedSha,
    expectedRelease,
    expectedProductionAnchor,
  });

  requireValue(productionAfter.readyState === 'READY', 'Production deployment is not READY after promotion.');
  requireValue(productionAfter.target === 'production', 'Production domain does not resolve to a Production deployment.');
  requireValue(
    productionAfter.id === candidateInspect.id,
    'Production does not resolve to the exact reviewed staged candidate.',
  );

  const productionAliases = new Set(deploymentAliases(productionAfter));
  for (const domain of PRODUCTION_DOMAINS) {
    requireValue(productionAliases.has(domain), `Production promotion is missing the ${domain} alias.`);
  }

  const promoted = findListedDeployment(productionList, productionAfter);
  requireValue(promoted, 'Current Production is absent from the linked Vercel project deployment list.');
  requireValue(promoted.target === 'production', 'Current listed deployment is not Production-targeted.');
  requireValue((promoted.readyState || promoted.state) === 'READY', 'Current listed Production is not READY.');
  verifyMetadata(promoted.meta, expectedSha, expectedRelease, 'Production');

  writeFileSync(options.output, `${JSON.stringify({
    schemaVersion: 'cp.vercel-production-receipt.v1',
    release: expectedRelease,
    gitCommitSha: expectedSha,
    reviewedCandidateDeploymentId: candidateInspect.id,
    productionBeforeDeploymentId: productionBefore.id,
    productionAfterDeploymentId: productionAfter.id,
    productionUrl: productionAfter.url,
    exactArtifactPromoted: true,
    checkoutEnabled: false,
  }, null, 2)}\n`);
} else {
  throw new Error(`Unknown verification mode: ${mode || '<missing>'}`);
}
