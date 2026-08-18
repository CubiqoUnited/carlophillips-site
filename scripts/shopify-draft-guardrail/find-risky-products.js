#!/usr/bin/env node

const {
  getConfig,
  getEnvReadiness,
  parseArgs,
  printJson,
  safetyDecision,
  shopifyAdminGraphql,
  summarizeProduct,
  writeReport,
} = require('./shopify-admin-client');
const { forceProductDraftById } = require('./force-product-draft');

const PRODUCTS_QUERY = `
  query FindRecentProducts($first: Int!, $after: String, $query: String!) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true, query: $query) {
      nodes {
        id
        title
        handle
        vendor
        status
        createdAt
        updatedAt
        productType
        tags
        launchStatusMetafield: metafield(namespace: "carlophillips", key: "launch_status") {
          namespace
          key
          value
          type
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function buildProductQuery(config) {
  return `created_at:>=${config.createdAfterIso}`;
}

function productLooksRisky(product, config) {
  const summary = summarizeProduct(product, config);
  return summary.detectionReasons.some((reason) => (
    reason === 'vendor' ||
    reason === 'title' ||
    reason === 'automation_tag' ||
    reason === 'launch_status_metafield'
  ));
}

async function findRiskyProducts(config) {
  const readiness = getEnvReadiness();
  if (!readiness.ready) {
    return {
      envReady: false,
      products: [],
      skipped: [{ reason: 'missing_env', readiness }],
    };
  }

  const pageSize = Math.min(Math.max(config.limit, 1), 250);
  let after = null;
  const products = [];
  const skipped = [];

  do {
    const data = await shopifyAdminGraphql(PRODUCTS_QUERY, {
      first: pageSize,
      after,
      query: buildProductQuery(config),
    });

    const connection = data.products;
    for (const product of connection.nodes) {
      if (productLooksRisky(product, config)) {
        products.push(product);
      } else {
        skipped.push({
          id: product.id,
          title: product.title,
          vendor: product.vendor,
          reason: 'did_not_match_detection_criteria',
        });
      }
    }

    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
  } while (after && products.length < config.limit);

  return { envReady: true, products, skipped };
}

async function buildRiskReport(config) {
  const readiness = getEnvReadiness();
  const result = await findRiskyProducts(config);
  const summaries = result.products.map((product) => summarizeProduct(product, config));
  const wouldModify = summaries.filter((item) => item.safety.canModify && item.updateNeeds.shouldModify);
  const skipped = [
    ...result.skipped,
    ...summaries
      .filter((item) => !item.safety.canModify || !item.updateNeeds.shouldModify)
      .map((item) => ({
        id: item.id,
        title: item.title,
        vendor: item.vendor,
        status: item.status,
        reasons: item.safety.canModify ? ['already_guarded_or_draft'] : item.safety.reasons,
      })),
  ];

  return {
    timestamp: new Date().toISOString(),
    criteria: config,
    productsFound: summaries,
    wouldModify,
    skipped,
    envReadiness: readiness,
    noSecretsConfirmed: true,
  };
}

async function main() {
  const args = parseArgs();
  const config = getConfig(args);
  const dryRun = !args.enforce;
  const report = await buildRiskReport(config);

  if (args.enforce) {
    const enforcementResults = [];
    for (const item of report.wouldModify) {
      const decision = safetyDecision(item, config);
      if (!decision.canModify) {
        enforcementResults.push({ id: item.id, skipped: true, reasons: decision.reasons });
        continue;
      }
      enforcementResults.push(await forceProductDraftById(item.id, { config, enforce: true }));
    }
    report.enforcementResults = enforcementResults;
    report.dryRun = false;
    report.reportPath = writeReport('enforcement-report.json', report);
  } else {
    report.dryRun = dryRun;
    report.reportPath = writeReport('dry-run-report.json', report);
  }

  printJson(report);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  buildProductQuery,
  buildRiskReport,
  findRiskyProducts,
  productLooksRisky,
};
