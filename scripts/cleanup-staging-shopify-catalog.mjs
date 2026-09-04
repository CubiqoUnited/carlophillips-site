import { writeFileSync } from 'node:fs';

const API_VERSION = '2026-07';
const APPROVED_HANDLE = 'carlophillips-signature-hoodie';
const EXPECTED_REMOVALS = 15;

function required(value, code) {
  if (!value) throw new Error(code);
  return value.trim();
}

const store = required(
  process.env.SHOPIFY_STAGING_STORE_DOMAIN,
  'SHOPIFY_STAGING_STORE_DOMAIN_REQUIRED'
).toLowerCase();
const productionStore = required(
  process.env.SHOPIFY_PRODUCTION_STORE_DOMAIN,
  'SHOPIFY_PRODUCTION_STORE_DOMAIN_REQUIRED'
).toLowerCase();
const token = required(
  process.env.SHOPIFY_STAGING_ADMIN_TOKEN,
  'SHOPIFY_STAGING_ADMIN_TOKEN_REQUIRED'
);
const output =
  process.env.CP_SHOPIFY_CLEANUP_OUTPUT || 'staging-shopify-cleanup.json';

if (
  !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(store) ||
  store === productionStore
) {
  throw new Error('STAGING_STORE_ISOLATION_INVALID');
}

async function graphql(query, variables = {}) {
  const response = await fetch(
    `https://${store}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!response.ok) throw new Error(`SHOPIFY_ADMIN_HTTP_${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length || !payload.data)
    throw new Error('SHOPIFY_ADMIN_GRAPHQL_REJECTED');
  return payload.data;
}

const before = await graphql(`
  query StagingCatalogCleanupInventory {
    shop {
      id
      plan {
        partnerDevelopment
      }
    }
    products(first: 100, sortKey: TITLE) {
      nodes {
        id
        handle
        title
        status
      }
    }
  }
`);
if (before.shop?.plan?.partnerDevelopment !== true)
  throw new Error('SHOPIFY_DEVELOPMENT_STORE_REQUIRED');

const products = before.products?.nodes || [];
const approved = products.filter(
  (product) => product.handle === APPROVED_HANDLE
);
const removals = products.filter(
  (product) => product.handle !== APPROVED_HANDLE
);
if (
  approved.length !== 1 ||
  approved[0].status !== 'ACTIVE' ||
  removals.length !== EXPECTED_REMOVALS
) {
  throw new Error(
    `CATALOG_SCOPE_CHANGED_approved_${approved.length}_removals_${removals.length}`
  );
}

const deleted = [];
for (const product of removals) {
  const data = await graphql(
    `
      mutation DeleteStagingDemoProduct($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `,
    { input: { id: product.id } }
  );
  const result = data.productDelete;
  if (result.userErrors?.length || result.deletedProductId !== product.id)
    throw new Error(`PRODUCT_DELETE_FAILED_${product.handle}`);
  deleted.push({
    id: product.id,
    handle: product.handle,
    title: product.title,
  });
}

const after = await graphql(`
  query StagingCatalogCleanupVerification {
    products(first: 100) {
      nodes {
        id
        handle
        title
        status
      }
    }
  }
`);
const remaining = after.products?.nodes || [];
if (
  remaining.length !== 1 ||
  remaining[0].handle !== APPROVED_HANDLE ||
  remaining[0].status !== 'ACTIVE'
) {
  throw new Error('STAGING_CATALOG_POSTCONDITION_INVALID');
}

writeFileSync(
  output,
  `${JSON.stringify(
    {
      schemaVersion: 'cp.staging-shopify-catalog-cleanup.v1',
      stagingStore: store,
      productionStoreTouched: false,
      approvedHandle: APPROVED_HANDLE,
      deleted,
      remaining,
    },
    null,
    2
  )}\n`
);
console.log(
  `Deleted ${deleted.length} demo products; retained ${APPROVED_HANDLE}.`
);
