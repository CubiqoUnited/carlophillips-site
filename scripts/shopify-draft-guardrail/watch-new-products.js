#!/usr/bin/env node

const {
  getConfig,
  parseArgs,
  printJson,
  writeReport,
} = require('./shopify-admin-client');
const { buildRiskReport } = require('./find-risky-products');
const { forceProductDraftById } = require('./force-product-draft');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = parseArgs();
  const minutes = Number(args.minutes || 10);
  const intervalSeconds = Number(args.intervalSeconds || 10);
  const forever = Boolean(args.forever);
  const enforce = Boolean(args.enforce);
  const config = getConfig(args);
  const startedAt = new Date();
  const endsAt = forever ? null : new Date(startedAt.getTime() + minutes * 60 * 1000);
  const seen = new Set();
  const actions = [];

  if (enforce) {
    console.warn('ENFORCE MODE: matching products will be updated to DRAFT with review tags/metafield.');
  } else {
    console.warn('DRY-RUN MODE: no products will be modified.');
  }

  do {
    const report = await buildRiskReport(config);
    for (const product of report.wouldModify) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);

      if (enforce) {
        actions.push(await forceProductDraftById(product.id, { config, enforce: true }));
      } else {
        actions.push({
          dryRun: true,
          wouldEnforce: true,
          product,
        });
      }
    }

    if (!forever && Date.now() >= endsAt.getTime()) break;
    await sleep(intervalSeconds * 1000);
  } while (forever || Date.now() < endsAt.getTime());

  const watchReport = {
    timestamp: new Date().toISOString(),
    startedAt: startedAt.toISOString(),
    endedAt: new Date().toISOString(),
    minutes,
    intervalSeconds,
    forever,
    dryRun: !enforce,
    criteria: config,
    actions,
    noSecretsConfirmed: true,
  };

  watchReport.reportPath = writeReport('watch-report.json', watchReport);
  printJson(watchReport);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
