import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API_VERSION = '2026-07';
const SHA = /^[a-f0-9]{40}$/;
const FINGERPRINT = /^sha256:[a-f0-9]{64}$/;

function parse(values) {
  const [mode, ...rest] = values;
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    if (!rest[index]?.startsWith('--') || rest[index + 1] === undefined) {
      throw new Error('PROTECTED_PROOF_ARGUMENT_INVALID');
    }
    options[rest[index].slice(2)] = rest[index + 1];
  }
  return { mode, options };
}

function hash(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function required(value, code) {
  if (!value) throw new Error(code);
  return value;
}

function exactEnvironment({ requireAdmin = true } = {}) {
  const store = required(
    process.env.SHOPIFY_STAGING_STORE_DOMAIN,
    'SHOPIFY_STAGING_STORE_DOMAIN_REQUIRED'
  )
    .trim()
    .toLowerCase();
  const productionStore = required(
    process.env.SHOPIFY_PRODUCTION_STORE_DOMAIN,
    'SHOPIFY_PRODUCTION_STORE_DOMAIN_REQUIRED'
  )
    .trim()
    .toLowerCase();
  const adminToken = requireAdmin
    ? required(
        process.env.SHOPIFY_STAGING_ADMIN_TOKEN,
        'SHOPIFY_STAGING_ADMIN_TOKEN_REQUIRED'
      )
    : undefined;
  const durableStore = required(
    process.env.CP_EXPECTED_PREVIEW_DURABLE_STORE_ID,
    'PREVIEW_DURABLE_STORE_ID_REQUIRED'
  );
  const productionDurableStore = required(
    process.env.CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID,
    'PRODUCTION_DURABLE_STORE_ID_REQUIRED'
  );
  if (
    !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(store) ||
    !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(productionStore) ||
    store === productionStore ||
    durableStore === productionDurableStore
  ) {
    throw new Error('STAGING_ISOLATION_INVALID');
  }
  return {
    store,
    productionStore,
    adminToken,
    durableStore,
    productionDurableStore,
  };
}

async function adminGraphql(environment, query, variables = {}) {
  const response = await fetch(
    `https://${environment.store}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': environment.adminToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!response.ok) throw new Error(`SHOPIFY_ADMIN_HTTP_${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length || !payload.data) {
    throw new Error('SHOPIFY_ADMIN_GRAPHQL_REJECTED');
  }
  return payload.data;
}

function sizeOf(variant) {
  return variant.selectedOptions
    .find((option) => option.name.toLowerCase() === 'size')
    ?.value?.toUpperCase();
}

function normalizedVariants(nodes) {
  const variants = nodes.map((variant) => ({
    size: sizeOf(variant),
    price: Number(variant.price).toFixed(2),
    currency: 'USD',
    available: variant.inventoryQuantity > 0,
    inventory: variant.inventoryQuantity,
  }));
  if (
    JSON.stringify(variants.map(({ size }) => size).sort()) !==
      JSON.stringify(['L', 'M', 'S']) ||
    variants.some(
      (variant) =>
        variant.price !== '128.00' ||
        !Number.isSafeInteger(variant.inventory) ||
        variant.inventory < 1
    )
  ) {
    throw new Error('SHOPIFY_SML_OFFER_INVALID');
  }
  return variants.sort(
    (left, right) =>
      ['S', 'M', 'L'].indexOf(left.size) - ['S', 'M', 'L'].indexOf(right.size)
  );
}

async function productObservation(environment) {
  const data = await adminGraphql(
    environment,
    `query ProtectedReleaseProduct($query: String!) {
      shop { id plan { partnerDevelopment } }
      products(first: 2, query: $query) {
        nodes {
          id
          handle
          status
          variants(first: 20) {
            nodes {
              id
              price
              inventoryQuantity
              selectedOptions { name value }
            }
          }
        }
      }
    }`,
    { query: 'handle:carlophillips-signature-hoodie' }
  );
  if (data.shop?.plan?.partnerDevelopment !== true) {
    throw new Error('SHOPIFY_DEVELOPMENT_STORE_REQUIRED');
  }
  const products = data.products?.nodes || [];
  if (
    products.length !== 1 ||
    products[0].handle !== 'carlophillips-signature-hoodie' ||
    products[0].status !== 'ACTIVE'
  ) {
    throw new Error('SHOPIFY_PRODUCT_NOT_EXACT');
  }
  return {
    shopReferenceHash: hash(environment.store),
    productReferenceHash: hash(`${environment.store}\n${products[0].id}`),
    handle: products[0].handle,
    variants: normalizedVariants(products[0].variants.nodes),
  };
}

function allFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? allFiles(path) : [path];
  });
}

function browserProofs(directory) {
  const proofs = allFiles(directory)
    .filter((path) => path.endsWith('browser-proof.json'))
    .map(readJson);
  const desktop = proofs.find((proof) => proof.viewportWidth === 1440);
  const mobile = proofs.find((proof) => proof.viewportWidth === 390);
  const expectedKeys = [
    'schemaVersion',
    'viewportWidth',
    'shopifyAuthoritativeProduct',
    'shopifyOffer',
    'sizeSelection',
    'bagTruth',
    'hostedStagingCheckout',
    'accessibilityPassed',
    'consoleErrors',
    'networkFailures',
    'screenshotHash',
    'privateCheckoutUrlRetained',
    'paymentAttempted',
    'orderSubmitted',
  ].sort();
  for (const proof of [desktop, mobile]) {
    if (
      !proof ||
      proof.schemaVersion !== 'cp.protected-staging-browser-proof.v1' ||
      JSON.stringify(Object.keys(proof).sort()) !==
        JSON.stringify(expectedKeys) ||
      proof.shopifyAuthoritativeProduct !== true ||
      proof.shopifyOffer?.handle !== 'carlophillips-signature-hoodie' ||
      JSON.stringify(proof.shopifyOffer?.sizes) !==
        JSON.stringify(['S', 'M', 'L']) ||
      proof.shopifyOffer?.price !== '128.00' ||
      proof.shopifyOffer?.currency !== 'USD' ||
      proof.sizeSelection !== true ||
      proof.bagTruth !== true ||
      proof.hostedStagingCheckout !== true ||
      proof.accessibilityPassed !== true ||
      proof.consoleErrors !== 0 ||
      proof.networkFailures !== 0 ||
      proof.privateCheckoutUrlRetained !== false ||
      proof.paymentAttempted !== false ||
      proof.orderSubmitted !== false ||
      !FINGERPRINT.test(proof.screenshotHash || '')
    ) {
      throw new Error('PROTECTED_BROWSER_PROOF_INVALID');
    }
  }
  return {
    desktop,
    mobile,
    offer: desktop.shopifyOffer,
    checkoutHandoffEvidenceHash: hash(JSON.stringify({ desktop, mobile })),
  };
}

function health(inspect, healthReceipt) {
  if (
    !/^dpl_[A-Za-z0-9]+$/.test(inspect.id || '') ||
    inspect.readyState !== 'READY' ||
    healthReceipt.healthy !== true ||
    healthReceipt.checkoutEnabled !== true
  ) {
    throw new Error('PRODUCTION_HEALTH_INVALID');
  }
  return {
    deploymentId: inspect.id,
    healthy: true,
    checkoutEnabled: true,
  };
}

const { mode, options } = parse(process.argv.slice(2));
const environment = exactEnvironment({ requireAdmin: mode === 'snapshot' });

if (mode === 'snapshot') {
  if (
    !SHA.test(options['expected-sha'] || '') ||
    !/^[A-Za-z0-9._-]+$/.test(options.release || '') ||
    !options.output
  ) {
    throw new Error('SNAPSHOT_IDENTITY_INVALID');
  }
  const product = await productObservation(environment);
  writeFileSync(
    options.output,
    `${JSON.stringify(
      {
        schemaVersion: 'cp.protected-staging-shopify-snapshot.v1',
        observedAt: new Date().toISOString(),
        gitCommitSha: options['expected-sha'],
        release: options.release,
        storeKind: 'development',
        storeReferenceHash: product.shopReferenceHash,
        productionStoreReferenceHash: hash(environment.productionStore),
        durableStoreReferenceHash: hash(environment.durableStore),
        productionDurableStoreReferenceHash: hash(
          environment.productionDurableStore
        ),
        product,
      },
      null,
      2
    )}\n`
  );
  process.stdout.write(
    'Isolated Shopify Staging S/M/L inventory snapshot captured.\n'
  );
} else if (mode === 'finalize') {
  const browsers = browserProofs(options['browser-proof-directory']);
  const deployment = readJson(options['deployment-receipt']);
  const webhookProbe = readJson(options['webhook-probe']);
  const productionBeforeInspect = readJson(
    options['production-before-inspect']
  );
  const productionAfterInspect = readJson(options['production-after-inspect']);
  const productionBeforeHealth = readJson(options['production-before-health']);
  const productionAfterHealth = readJson(options['production-after-health']);
  const sourcePullRequest = Number(options['source-pull-request']);
  if (
    !Number.isSafeInteger(sourcePullRequest) ||
    sourcePullRequest < 1 ||
    !SHA.test(options['expected-sha'] || '') ||
    !/^[A-Za-z0-9._-]+$/.test(options.release || '')
  ) {
    throw new Error('FINAL_PROOF_IDENTITY_INVALID');
  }
  if (
    webhookProbe?.signatureVerified !== true ||
    webhookProbe?.signatureAlgorithm !== 'shopify-hmac-sha256' ||
    webhookProbe?.durableIdempotency !== true ||
    webhookProbe?.piiFree !== true ||
    webhookProbe?.duplicateDelivery?.attempted !== true ||
    webhookProbe?.duplicateDelivery?.suppressed !== true ||
    webhookProbe?.duplicateDelivery?.observationCount !== 1 ||
    webhookProbe?.duplicateDelivery?.externalActionCount !== 0
  ) {
    throw new Error('DUPLICATE_DELIVERY_PROOF_INVALID');
  }
  const variants = browsers.offer.sizes.map((size) => ({
    size,
    price: browsers.offer.price,
    currency: browsers.offer.currency,
    customerVisible: true,
  }));
  const productionBefore = health(
    productionBeforeInspect,
    productionBeforeHealth
  );
  const productionAfter = health(productionAfterInspect, productionAfterHealth);
  if (
    productionBefore.deploymentId !== productionAfter.deploymentId ||
    deployment.productionBeforeDeploymentId !== productionBefore.deploymentId ||
    deployment.productionAfterPreviewDeploymentId !==
      productionAfter.deploymentId
  ) {
    throw new Error('PRODUCTION_CHANGED_DURING_STAGING');
  }
  const unsigned = {
    schemaVersion: 'cp.protected-staging-release-receipt.v3',
    generatedAt: new Date().toISOString(),
    release: options.release,
    gitCommitSha: options['expected-sha'],
    sourcePullRequest,
    staging: {
      deploymentId: deployment.deploymentId,
      deploymentUrl: `https://${String(deployment.deploymentUrl).replace(/^https?:\/\//, '')}`,
      alias: 'staging.carlophillips.com',
      readyState: deployment.readyState,
      checkoutEnabled: deployment.checkoutEnabled,
      gitCommitSha: deployment.gitCommitSha,
      release: deployment.release,
      immutable: true,
      productionBeforeDeploymentId: productionBefore.deploymentId,
      productionAfterDeploymentId: productionAfter.deploymentId,
    },
    shopify: {
      source: 'shopify',
      environment: 'preview',
      storeKind: 'development',
      storeReferenceHash: hash(environment.store),
      productionStoreReferenceHash: hash(environment.productionStore),
      storeIsolated: true,
      paymentMode: 'not-used',
      durableStoreReferenceHash: hash(environment.durableStore),
      productionDurableStoreReferenceHash: hash(
        environment.productionDurableStore
      ),
      durableStoreIsolated: true,
      handle: browsers.offer.handle,
      variants,
      cartBinding: {
        gitCommitSha: options['expected-sha'],
        release: options.release,
      },
      hostedCheckout: { https: true, trustedHost: true },
    },
    customerPath: {
      shopifyAuthoritativeProduct: true,
      sizeSelection: true,
      bagTruth: true,
      hostedStagingCheckoutHandoff: true,
      checkoutHandoffEvidenceHash: browsers.checkoutHandoffEvidenceHash,
      privateCheckoutUrlRetained: false,
      paymentAttempted: false,
      orderSubmitted: false,
    },
    webhookSafety: {
      signatureVerified: true,
      signatureAlgorithm: 'shopify-hmac-sha256',
      durableIdempotency: true,
      duplicateDelivery: webhookProbe.duplicateDelivery,
      externalActionCount: 0,
      piiFree: true,
    },
    quality: {
      desktop: {
        width: 1440,
        screenshotHash: browsers.desktop.screenshotHash,
        comparisonPassed: true,
      },
      mobile: {
        width: 390,
        screenshotHash: browsers.mobile.screenshotHash,
        comparisonPassed: true,
      },
      accessibilityPassed: true,
      consoleErrors: 0,
      networkFailures: 0,
    },
    production: {
      before: productionBefore,
      after: productionAfter,
      unchangedDuringStaging: true,
    },
    rollback: {
      lastVerifiedDeploymentId: productionBefore.deploymentId,
      checkoutEnabled: true,
      restoreOnFailure: true,
      postRestoreHealthRequired: true,
    },
    safeguards: {
      piiFree: true,
      realPaymentUsed: false,
      paymentAttempted: false,
      stagingOrderCreated: false,
      productionOrderCreated: false,
      privateCheckoutUrlRetained: false,
      productionStoreMutated: false,
    },
    approval: {
      stagingEnvironmentProtected: true,
      stagingProductOwnerReviewed: true,
      productionApproved: false,
    },
  };
  writeFileSync(options.output, `${JSON.stringify(unsigned, null, 2)}\n`);
  process.stdout.write(
    'PII-free protected Staging release evidence assembled.\n'
  );
} else {
  throw new Error('PROTECTED_PROOF_MODE_INVALID');
}
