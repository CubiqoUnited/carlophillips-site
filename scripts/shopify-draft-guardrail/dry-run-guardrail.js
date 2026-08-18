#!/usr/bin/env node

const { getConfig, parseArgs, printJson, writeReport } = require('./shopify-admin-client');
const { buildRiskReport } = require('./find-risky-products');

async function main() {
  const args = parseArgs();
  const config = getConfig({ ...args, enforce: false });
  const report = await buildRiskReport(config);
  report.dryRun = true;
  report.reportPath = writeReport('dry-run-report.json', report);
  printJson(report);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
