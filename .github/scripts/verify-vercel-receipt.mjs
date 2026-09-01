import { readFileSync, writeFileSync } from 'node:fs';

const PRODUCTION_DOMAINS = new Set(['carlophillips.com', 'www.carlophillips.com']);
const DEPLOYMENT_ID = /^dpl_[A-Za-z0-9]+$/;
const ARTIFACTS = Object.freeze({
  preview: Object.freeze({
    artifactKind: 'immutable-preview',
    buildEnvironment: 'preview',
    target: 'preview',
  }),
  candidate: Object.freeze({
    artifactKind: 'staged-production',
    buildEnvironment: 'production',
    target: 'production',
  }),
  fallback: Object.freeze({
    artifactKind: 'safe-fallback',
    buildEnvironment: 'production',
    target: 'production',
  }),
});

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
  if (!path) throw new Error('A required JSON input path is missing.');
  return JSON.parse(readFileSync(path, 'utf8'));
}

function deploymentUrl(value) {
  return String(value || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function deploymentAliases(deployment = {}) {
  const values = Array.isArray(deployment.aliases)
    ? deployment.aliases
    : (Array.isArray(deployment.alias) ? deployment.alias : []);
  return values.map(deploymentUrl);
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function metadataSha(metadata = {}) {
  return metadata.cpGitCommitSha || metadata.gitCommitSha || metadata.githubCommitSha || null;
}

function findListedDeployment(list, inspect, subject) {
  const deployments = Array.isArray(list?.deployments) ? list.deployments : [];
  const listed = deployments.find(deployment => deployment.id === inspect.id) || null;
  requireValue(listed, `${subject} is absent from the linked Vercel project deployment list.`);
  requireValue(
    deploymentUrl(listed.url) === deploymentUrl(inspect.url),
    `${subject} deployment URL does not match its project-list identity.`,
  );
  return listed;
}

function requireNoAliases(deployment, subject) {
  const aliases = deploymentAliases(deployment);
  for (const alias of aliases) {
    if (PRODUCTION_DOMAINS.has(alias)) {
      throw new Error(`${subject} contains a production domain alias (${alias}).`);
    }
  }
}

function requireTarget(deployment, expected, subject) {
  if (expected === 'preview') {
    requireValue(
      deployment.target === null || deployment.target === undefined || deployment.target === 'preview',
      `${subject} is not a Preview-target deployment.`,
    );
    return;
  }
  requireValue(deployment.target === expected, `${subject} is not a ${expected} deployment.`);
}

function verifyMetadata(
  metadata,
  expectedSha,
  expectedRelease,
  role,
  subject,
  expectedPullRequest = null,
  expectedCheckoutEnabled = false,
) {
  const contract = ARTIFACTS[role];
  requireValue(contract, `Unknown artifact role ${role}.`);
  requireValue(metadataSha(metadata) === expectedSha, `${subject} metadata SHA does not match the selected source.`);
  requireValue(metadata?.cpRelease === expectedRelease, `${subject} release metadata does not match the requested release.`);
  requireValue(metadata?.cpArtifactKind === contract.artifactKind, `${subject} has the wrong artifact role.`);
  requireValue(metadata?.cpBuildEnvironment === contract.buildEnvironment, `${subject} has the wrong build environment.`);
  requireValue(
    metadata?.cpCheckoutEnabled === String(expectedCheckoutEnabled),
    `${subject} checkout marker does not match the reviewed release mode.`,
  );
  if (role === 'preview') {
    requireValue(String(metadata?.cpPullRequest || '') === String(expectedPullRequest || ''), `${subject} pull-request metadata does not match.`);
  }
}

function verifyArtifact({
  inspect,
  list,
  expectedSha,
  expectedRelease,
  role,
  subject,
  expectedPullRequest = null,
  expectedCheckoutEnabled = false,
}) {
  const contract = ARTIFACTS[role];
  requireValue(DEPLOYMENT_ID.test(inspect?.id || ''), `${subject} lacks a valid deployment ID.`);
  requireValue(Boolean(deploymentUrl(inspect?.url)), `${subject} lacks an immutable deployment URL.`);
  requireValue(inspect.readyState === 'READY', `${subject} is not READY.`);
  requireTarget(inspect, contract.target, subject);
  requireNoAliases(inspect, subject);

  const listed = findListedDeployment(list, inspect, subject);
  requireValue((listed.readyState || listed.state) === 'READY', `Listed ${subject} is not READY.`);
  requireTarget(listed, contract.target, `Listed ${subject}`);
  requireNoAliases(listed, `Listed ${subject}`);
  verifyMetadata(
    listed.meta,
    expectedSha,
    expectedRelease,
    role,
    subject,
    expectedPullRequest,
    expectedCheckoutEnabled,
  );
  return { inspect, listed };
}

function verifyProductionAnchor(deployment, expectedProductionAnchor = null) {
  requireValue(DEPLOYMENT_ID.test(deployment?.id || ''), 'Production drift anchor lacks a valid deployment ID.');
  requireValue(deployment.readyState === 'READY', 'Production drift anchor is not READY.');
  requireValue(deployment.target === 'production', 'Production drift anchor is not a Production deployment.');
  const aliases = new Set(deploymentAliases(deployment));
  for (const domain of PRODUCTION_DOMAINS) {
    requireValue(aliases.has(domain), `Production drift anchor is missing the ${domain} alias.`);
  }
  if (expectedProductionAnchor) {
    requireValue(deployment.id === expectedProductionAnchor, 'Current Production does not match the reviewed drift anchor.');
  }
  return deployment;
}

function verifyProductionUnchanged(productionBefore, productionAfter) {
  verifyProductionAnchor(productionAfter);
  requireValue(
    productionAfter.id === productionBefore.id,
    'Current Production changed while immutable artifacts were being staged or selected.',
  );
}

function verifyCandidatePair({
  candidateInspect,
  fallbackInspect,
  deploymentList,
  productionBefore,
  productionAfter,
  expectedSha,
  expectedRelease,
  expectedProductionAnchor = null,
  expectedCandidateCheckout = false,
}) {
  const candidate = verifyArtifact({
    inspect: candidateInspect,
    list: deploymentList,
    expectedSha,
    expectedRelease,
    role: 'candidate',
    subject: 'Staged Production candidate',
    expectedCheckoutEnabled: expectedCandidateCheckout,
  });
  const fallback = verifyArtifact({
    inspect: fallbackInspect,
    list: deploymentList,
    expectedSha,
    expectedRelease,
    role: 'fallback',
    subject: 'Safe fallback',
  });
  const anchor = verifyProductionAnchor(productionBefore, expectedProductionAnchor);

  requireValue(candidate.inspect.id !== fallback.inspect.id, 'Candidate and safe fallback must be distinct deployments.');
  requireValue(deploymentUrl(candidate.inspect.url) !== deploymentUrl(fallback.inspect.url), 'Candidate and safe fallback must have distinct immutable URLs.');
  requireValue(candidate.inspect.id !== anchor.id, 'Candidate is already the current Production deployment.');
  requireValue(fallback.inspect.id !== anchor.id, 'Current Production drift anchor cannot be used as the safe fallback.');
  verifyProductionUnchanged(anchor, productionAfter);

  return { candidate, fallback, anchor };
}

function promotionSourceId(deployment, listed) {
  return listed?.originalDeploymentId
    || listed?.meta?.originalDeploymentId
    || deployment?.originalDeploymentId
    || deployment?.meta?.originalDeploymentId
    || null;
}

function verifyPromotedProduction({
  productionAfter,
  productionList,
  source,
  role,
  expectedSha,
  expectedRelease,
  expectedCheckoutEnabled = false,
}) {
  const subject = role === 'candidate' ? 'Promoted Production candidate' : 'Promoted safe fallback';
  requireValue(DEPLOYMENT_ID.test(productionAfter?.id || ''), `${subject} lacks a valid deployment ID.`);
  requireValue(productionAfter.readyState === 'READY', `${subject} is not READY.`);
  requireValue(productionAfter.target === 'production', `${subject} is not a Production deployment.`);
  const aliases = new Set(deploymentAliases(productionAfter));
  for (const domain of PRODUCTION_DOMAINS) {
    requireValue(aliases.has(domain), `${subject} is missing the ${domain} alias.`);
  }

  const listed = findListedDeployment(productionList, productionAfter, subject);
  requireValue((listed.readyState || listed.state) === 'READY', `Listed ${subject} is not READY.`);
  requireValue(listed.target === 'production', `Listed ${subject} is not Production-targeted.`);
  verifyMetadata(
    listed.meta,
    expectedSha,
    expectedRelease,
    role,
    subject,
    null,
    expectedCheckoutEnabled,
  );

  const directIdentity = productionAfter.id === source.inspect.id;
  const promotedFrom = promotionSourceId(productionAfter, listed);
  const providerPromotionIdentity = listed?.meta?.action === 'promote' && promotedFrom === source.inspect.id;
  requireValue(directIdentity || providerPromotionIdentity, `${subject} does not resolve to the exact reviewed source deployment.`);

  return { listed, promotedFrom: directIdentity ? source.inspect.id : promotedFrom };
}

const { mode, options } = parseArguments(process.argv.slice(2));
const expectedSha = options['expected-sha'];
const expectedRelease = options['expected-release'];
const expectedProductionAnchor = options['expected-production-anchor'] || null;
const expectedCandidateCheckoutValue = options['expected-candidate-checkout'] || 'false';
requireValue(/^[0-9a-f]{40}$/.test(expectedSha || ''), 'Expected SHA must be a full lowercase commit SHA.');
requireValue(/^[A-Za-z0-9._-]+$/.test(expectedRelease || ''), 'Expected release is invalid.');
requireValue(/^(true|false)$/.test(expectedCandidateCheckoutValue), 'Expected candidate checkout marker must be true or false.');
requireValue(Boolean(options.output), 'Output receipt path is required.');
const expectedCandidateCheckout = expectedCandidateCheckoutValue === 'true';

if (mode === 'preview') {
  const expectedPullRequest = options['expected-pull-request'];
  requireValue(/^[1-9][0-9]*$/.test(expectedPullRequest || ''), 'Expected pull-request number is invalid.');
  const preview = verifyArtifact({
    inspect: readJson(options['preview-inspect']),
    list: readJson(options['deployment-list']),
    expectedSha,
    expectedRelease,
    expectedPullRequest,
    role: 'preview',
    subject: 'Immutable Preview',
  });
  const productionBefore = verifyProductionAnchor(readJson(options['production-before']));
  const productionAfter = readJson(options['production-after']);
  verifyProductionUnchanged(productionBefore, productionAfter);

  writeFileSync(options.output, `${JSON.stringify({
    schemaVersion: 'cp.vercel-preview-receipt.v1',
    deploymentId: preview.inspect.id,
    deploymentUrl: preview.inspect.url,
    target: 'preview',
    readyState: preview.inspect.readyState,
    gitCommitSha: expectedSha,
    release: expectedRelease,
    pullRequest: Number(expectedPullRequest),
    artifactKind: ARTIFACTS.preview.artifactKind,
    buildEnvironment: ARTIFACTS.preview.buildEnvironment,
    checkoutEnabled: false,
    productionDomainsAssigned: false,
    productionBeforeDeploymentId: productionBefore.id,
    productionAfterPreviewDeploymentId: productionAfter.id,
  }, null, 2)}\n`);
} else if (mode === 'candidate-pair') {
  const pair = verifyCandidatePair({
    candidateInspect: readJson(options['candidate-inspect']),
    fallbackInspect: readJson(options['fallback-inspect']),
    deploymentList: readJson(options['deployment-list']),
    productionBefore: readJson(options['production-before']),
    productionAfter: readJson(options['production-after']),
    expectedSha,
    expectedRelease,
    expectedProductionAnchor,
    expectedCandidateCheckout,
  });

  writeFileSync(options.output, `${JSON.stringify({
    schemaVersion: 'cp.vercel-release-pair-receipt.v2',
    gitCommitSha: expectedSha,
    release: expectedRelease,
    candidateDeploymentId: pair.candidate.inspect.id,
    candidateDeploymentUrl: pair.candidate.inspect.url,
    candidateArtifactKind: ARTIFACTS.candidate.artifactKind,
    safeFallbackDeploymentId: pair.fallback.inspect.id,
    safeFallbackDeploymentUrl: pair.fallback.inspect.url,
    safeFallbackArtifactKind: ARTIFACTS.fallback.artifactKind,
    buildEnvironment: 'production',
    checkoutEnabled: expectedCandidateCheckout,
    safeFallbackCheckoutEnabled: false,
    deploymentsDistinct: true,
    productionDomainsAssigned: false,
    productionBeforeDeploymentId: pair.anchor.id,
    productionAfterStagingDeploymentId: pair.anchor.id,
  }, null, 2)}\n`);
} else if (mode === 'production' || mode === 'fallback-production') {
  requireValue(DEPLOYMENT_ID.test(expectedProductionAnchor || ''), 'Production verification requires the reviewed drift anchor.');
  const productionBefore = readJson(options['production-before']);
  const pair = verifyCandidatePair({
    candidateInspect: readJson(options['candidate-inspect']),
    fallbackInspect: readJson(options['fallback-inspect']),
    deploymentList: readJson(options['deployment-list']),
    productionBefore,
    productionAfter: productionBefore,
    expectedSha,
    expectedRelease,
    expectedProductionAnchor,
    expectedCandidateCheckout,
  });
  const productionAfter = readJson(options['production-after']);
  const role = mode === 'production' ? 'candidate' : 'fallback';
  const source = role === 'candidate' ? pair.candidate : pair.fallback;
  const promoted = verifyPromotedProduction({
    productionAfter,
    productionList: readJson(options['production-list']),
    source,
    role,
    expectedSha,
    expectedRelease,
    expectedCheckoutEnabled: role === 'candidate' ? expectedCandidateCheckout : false,
  });

  writeFileSync(options.output, `${JSON.stringify({
    schemaVersion: role === 'candidate' ? 'cp.vercel-production-receipt.v2' : 'cp.vercel-safe-fallback-receipt.v1',
    release: expectedRelease,
    gitCommitSha: expectedSha,
    artifactRole: ARTIFACTS[role].artifactKind,
    reviewedSourceDeploymentId: source.inspect.id,
    safeFallbackDeploymentId: pair.fallback.inspect.id,
    productionBeforeDeploymentId: pair.anchor.id,
    productionAfterDeploymentId: productionAfter.id,
    promotedFromDeploymentId: promoted.promotedFrom,
    productionUrl: productionAfter.url,
    exactArtifactPromoted: true,
    checkoutEnabled: role === 'candidate' ? expectedCandidateCheckout : false,
  }, null, 2)}\n`);
} else {
  throw new Error(`Unknown verification mode: ${mode || '<missing>'}`);
}
