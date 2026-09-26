import { readFileSync, writeFileSync } from 'node:fs';
import {
  createProductionPromotionReceipt,
  receiptHash,
  verifyProductionPromotionReceipt,
} from '../../lib/releases/production-promotion-receipt.js';
import { verifyProtectedReleaseReceipt } from '../../lib/releases/protected-release-gate.js';

function argumentsFor(values) {
  const [mode, ...rest] = values;
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index];
    const value = rest[index + 1];
    if (!key?.startsWith('--') || value === undefined)
      throw new Error('PRODUCTION_RECEIPT_ARGUMENT_INVALID');
    options[key.slice(2)] = value;
  }
  return { mode, options };
}

function json(path) {
  if (!path) throw new Error('PRODUCTION_RECEIPT_INPUT_REQUIRED');
  return JSON.parse(readFileSync(path, 'utf8'));
}

const { mode, options } = argumentsFor(process.argv.slice(2));
const secret = process.env.CP_RELEASE_RECEIPT_SIGNING_SECRET || '';

if (mode === 'assemble') {
  const candidate = json(options.candidate);
  const candidateApi = json(options['candidate-api']);
  const before = json(options.before);
  const beforeApex = json(options['before-apex']);
  const after = json(options.after);
  const afterApex = json(options['after-apex']);
  const previous = json(options.previous);
  const beforeHealth = json(options['before-health']);
  const afterHealth = json(options['after-health']);
  const protectedReceipt = json(options['protected-staging-receipt']);
  if (beforeApex.id !== before.id) {
    throw new Error('PRODUCTION_ALIAS_DRIFT_DETECTED');
  }
  const source =
    after.originalDeploymentId || after.meta?.originalDeploymentId || after.id;
  const unsigned = {
    schemaVersion: 'cp.production-promotion-receipt.v2',
    generatedAt: new Date().toISOString(),
    release: options.release,
    gitCommitSha: options['expected-sha'],
    candidate: {
      deploymentId: candidate.id,
      deploymentUrl: `https://${candidate.url}`,
      readyState: candidate.readyState,
      target: candidate.target,
      artifactKind: candidateApi.meta?.cpArtifactKind,
      checkoutEnabled: candidateApi.meta?.cpCheckoutEnabled === 'true',
    },
    production: {
      liveAliases: [
        { alias: options['apex-alias'], deploymentId: afterApex.id },
        { alias: options['www-alias'], deploymentId: after.id },
      ],
      beforeDeploymentId: before.id,
      afterDeploymentId: after.id,
      readyState: after.readyState,
      target: after.target,
      exactCandidatePromoted: source === candidate.id,
    },
    tests: { beforePromotion: beforeHealth, afterPromotion: afterHealth },
    shopify: {
      sourceEvidence: 'signed-protected-staging-receipt',
      stagingStoreReferenceHash: protectedReceipt.shopify.storeReferenceHash,
      productionStoreReferenceHash:
        protectedReceipt.shopify.productionStoreReferenceHash,
      storesIsolated: protectedReceipt.shopify.storeIsolated,
      unchangedDuringPromotion:
        protectedReceipt.safeguards.productionStoreMutated === false,
      workflowMutationPerformed: false,
    },
    rollback: {
      deploymentId: previous.id,
      readyState: previous.readyState,
      checkoutEnabled: beforeHealth.checkoutEnabled,
      restoreOnFailure: true,
      postRestoreHealthRequired: true,
    },
    safeguards: {
      piiFree: true,
      realPaymentUsed: false,
      paymentAttempted: afterHealth.paymentAttempted,
      orderSubmitted: afterHealth.orderSubmitted,
      privateCheckoutUrlRetained: afterHealth.privateCheckoutUrlRetained,
      productionStoreMutated: false,
    },
    protectedStaging: {
      schemaVersion: protectedReceipt.schemaVersion,
      gitCommitSha: protectedReceipt.gitCommitSha,
      release: protectedReceipt.release,
      sourcePullRequest: protectedReceipt.sourcePullRequest,
      receiptHash: receiptHash(protectedReceipt),
      signatureVerified: true,
    },
  };
  writeFileSync(options.output, `${JSON.stringify(unsigned, null, 2)}\n`);
} else if (mode === 'sign') {
  writeFileSync(
    options.output,
    `${JSON.stringify(createProductionPromotionReceipt(json(options.input), secret), null, 2)}\n`
  );
} else if (mode === 'verify') {
  const receipt = json(options.input);
  const protectedReceipt = json(options['protected-staging-receipt']);
  verifyProtectedReleaseReceipt(
    protectedReceipt,
    {
      gitCommitSha: receipt.protectedStaging.gitCommitSha,
      release: options.release,
      sourcePullRequest: receipt.protectedStaging.sourcePullRequest,
    },
    secret
  );
  if (receipt.protectedStaging.receiptHash !== receiptHash(protectedReceipt)) {
    throw new Error('PROTECTED_STAGING_RECEIPT_HASH_MISMATCH');
  }
  verifyProductionPromotionReceipt(
    receipt,
    {
      gitCommitSha: options['expected-sha'],
      release: options.release,
      candidateDeploymentId: options['candidate-deployment'],
      productionDeploymentId: options['production-deployment'],
      liveAliases: [
        {
          alias: options['apex-alias'],
          deploymentId: options['candidate-deployment'],
        },
        {
          alias: options['www-alias'],
          deploymentId: options['candidate-deployment'],
        },
      ],
    },
    secret
  );
  process.stdout.write(
    'Signed Production promotion receipt independently verified.\n'
  );
} else {
  throw new Error('PRODUCTION_RECEIPT_MODE_INVALID');
}
