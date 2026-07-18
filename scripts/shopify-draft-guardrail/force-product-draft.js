#!/usr/bin/env node

const {
  REVIEW_TAGS,
  assertNoUserErrors,
  getConfig,
  needsGuardrailUpdate,
  parseArgs,
  printJson,
  safetyDecision,
  shopifyAdminGraphql,
  summarizeProduct,
  writeReport,
} = require('./shopify-admin-client');

const PRODUCT_BY_ID_QUERY = `
  query ProductById($id: ID!) {
    product(id: $id) {
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
  }
`;

const PRODUCT_UPDATE_MUTATION = `
  mutation ForceProductDraft($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product {
        id
        title
        handle
        vendor
        status
        tags
        launchStatusMetafield: metafield(namespace: "carlophillips", key: "launch_status") {
          namespace
          key
          value
          type
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

async function getProductById(id) {
  const data = await shopifyAdminGraphql(PRODUCT_BY_ID_QUERY, { id });
  if (!data.product) {
    throw new Error(`Product not found: ${id}`);
  }
  return data.product;
}

function mergedReviewTags(existingTags = []) {
  const seen = new Set();
  const merged = [];
  for (const tag of [...existingTags, ...REVIEW_TAGS]) {
    const key = String(tag).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(tag);
    }
  }
  return merged;
}

async function forceProductDraftById(productId, options = {}) {
  const config = options.config || getConfig(options);
  const enforce = Boolean(options.enforce);
  const product = await getProductById(productId);
  const summary = summarizeProduct(product, config);
  const safety = safetyDecision(product, config);
  const updateNeeds = needsGuardrailUpdate(product);

  if (!safety.canModify) {
    return {
      product: summary,
      skipped: true,
      enforced: false,
      reasons: safety.reasons,
    };
  }

  if (!enforce) {
    return {
      product: summary,
      dryRun: true,
      enforced: false,
      wouldUpdate: updateNeeds,
    };
  }

  const data = await shopifyAdminGraphql(PRODUCT_UPDATE_MUTATION, {
    product: {
      id: product.id,
      status: 'DRAFT',
      tags: mergedReviewTags(product.tags),
      metafields: [{
        namespace: 'carlophillips',
        key: 'launch_status',
        value: 'needs_review',
        type: 'single_line_text_field',
      }],
    },
  });

  assertNoUserErrors(data);

  return {
    enforced: true,
    dryRun: false,
    product: data.productUpdate.product,
  };
}

async function main() {
  const args = parseArgs();
  const productId = args.productId || args.id;
  if (!productId) {
    throw new Error('Missing --product-id <gid>');
  }

  const config = getConfig(args);
  const result = await forceProductDraftById(productId, {
    config,
    enforce: Boolean(args.enforce),
  });

  const report = {
    timestamp: new Date().toISOString(),
    criteria: config,
    productId,
    result,
    dryRun: !args.enforce,
    noSecretsConfirmed: true,
  };

  report.reportPath = writeReport(args.enforce ? 'enforcement-report.json' : 'dry-run-report.json', report);
  printJson(report);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  PRODUCT_UPDATE_MUTATION,
  forceProductDraftById,
  getProductById,
  mergedReviewTags,
};
