import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { verifyStagingPromotionProvenance } from '../../lib/releases/staging-promotion-provenance.js';

function argumentsFor(values) {
  const options = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`INVALID_ARGUMENT_${key || 'MISSING'}`);
    }
    options[key.slice(2)] = value;
  }
  return options;
}

function commitExists(sha) {
  return (
    spawnSync('git', ['cat-file', '-e', `${sha}^{commit}`], {
      stdio: 'ignore',
    }).status === 0
  );
}

function isAncestor(ancestor, descendant) {
  return (
    spawnSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], {
      stdio: 'ignore',
    }).status === 0
  );
}

function tree(sha) {
  return execFileSync('git', ['rev-parse', `${sha}^{tree}`], {
    encoding: 'utf8',
  }).trim();
}

const options = argumentsFor(process.argv.slice(2));
const stagingSha = options['staging-sha'];
const productionSha = options['production-sha'];
const stagingCommitExists = commitExists(stagingSha);
const productionCommitExists = commitExists(productionSha);

const result = verifyStagingPromotionProvenance({
  stagingSha,
  productionSha,
  productionPullRequest: JSON.parse(
    readFileSync(options['production-pr-json'], 'utf8')
  ),
  repository: options.repository,
  stagingCommitExists,
  productionCommitExists,
  stagingIsAncestor:
    stagingCommitExists &&
    productionCommitExists &&
    isAncestor(stagingSha, productionSha),
  treesMatch:
    stagingCommitExists &&
    productionCommitExists &&
    tree(stagingSha) === tree(productionSha),
});

process.stdout.write(
  `Approved Staging tree ${result.stagingSha} was promoted unchanged through Production PR #${result.productionPullRequest} to ${result.productionSha}.\n`
);
