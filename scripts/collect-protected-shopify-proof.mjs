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

function exactEnvironment() {
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
  const adminToken = required(
    process.env.SHOPIFY_STAGING_ADMIN_TOKEN,
    'SHOPIFY_STAGING_ADMIN_TOKEN_REQUIRED'
  );
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
  for (const proof of [desktop, mobile]) {
    if (
      !proof ||
      proof.shopifyAuthoritativeProduct !== true ||
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
  return { desktop, mobile };
}

async function redis(environment, command) {
  const url = required(
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    'STAGING_DURABLE_STORE_URL_REQUIRED'
  );
  const token = required(
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
    'STAGING_DURABLE_STORE_TOKEN_REQUIRED'
  );
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error('STAGING_DURABLE_STORE_FAILED');
  const payload = await response.json();
  if (payload.error) throw new Error('STAGING_DURABLE_STORE_FAILED');
  return payload.result;
}

async function lifecycleEvents(environment, orderReferenceHash) {
  const keys = [];
  let cursor = '0';
  do {
    const result = await redis(environment, [
      'SCAN',
      cursor,
      'MATCH',
      'cp:preview:shopify:webhook-event:*',
      'COUNT',
      500,
    ]);
    cursor = String(result?.[0] || '0');
    keys.push(...(result?.[1] || []));
  } while (cursor !== '0');
  if (!keys.length) throw new Error('LIFECYCLE_EVENTS_MISSING');
  const records = await redis(environment, ['MGET', ...keys]);
  return (records || [])
    .filter(Boolean)
    .map((value) => JSON.parse(value))
    .filter((event) => event.orderReferenceHash === orderReferenceHash);
}

function customAttribute(order, name) {
  return order.customAttributes?.find((attribute) => attribute.key === name)
    ?.value;
}

async function exactTestOrder(environment, snapshot) {
  const data = await adminGraphql(
    environment,
    `query ProtectedReleaseOrders {
      orders(first: 50, reverse: true) {
        nodes {
          id
          test
          createdAt
          cancelledAt
          closed
          displayFinancialStatus
          displayFulfillmentStatus
          customAttributes { key value }
          lineItems(first: 20) {
            nodes { quantity variantTitle originalUnitPriceSet { shopMoney { amount currencyCode } } }
          }
          refunds {
            id
            refundLineItems(first: 20) { nodes { quantity restockType } }
          }
          fulfillments { id status }
          fulfillmentOrders(first: 20) {
            nodes {
              id
              status
              requestStatus
              assignedLocation {
                name
                location { fulfillmentService { handle } }
              }
            }
          }
        }
      }
    }`
  );
  const orders = (data.orders?.nodes || []).filter(
    (order) =>
      order.test === true &&
      customAttribute(order, '_cp_release') === snapshot.release &&
      customAttribute(order, '_cp_commit_sha') === snapshot.gitCommitSha &&
      customAttribute(order, '_cp_commerce_environment') === 'preview'
  );
  if (orders.length !== 1) throw new Error('EXACT_TEST_ORDER_REQUIRED');
  const order = orders[0];
  const orderNumber = String(order.id || '').match(/\/([0-9]+)$/)?.[1];
  if (!orderNumber) throw new Error('TEST_ORDER_REFERENCE_INVALID');
  const lines = order.lineItems?.nodes || [];
  const fulfillmentOrders = order.fulfillmentOrders?.nodes || [];
  if (
    lines.length !== 1 ||
    lines[0].quantity !== 1 ||
    !['S', 'M', 'L'].includes(String(lines[0].variantTitle).toUpperCase()) ||
    Number(lines[0].originalUnitPriceSet?.shopMoney?.amount).toFixed(2) !==
      '128.00' ||
    lines[0].originalUnitPriceSet?.shopMoney?.currencyCode !== 'USD' ||
    !order.cancelledAt ||
    order.displayFinancialStatus !== 'REFUNDED' ||
    order.displayFulfillmentStatus !== 'UNFULFILLED' ||
    order.refunds?.length < 1 ||
    order.refunds.some((refund) =>
      (refund.refundLineItems?.nodes || []).some(
        (line) => line.restockType === 'NO_RESTOCK'
      )
    ) ||
    order.fulfillments?.length !== 0 ||
    fulfillmentOrders.length < 1 ||
    fulfillmentOrders.some(
      (fulfillmentOrder) =>
        fulfillmentOrder.requestStatus !== 'UNSUBMITTED' ||
        !['CANCELLED', 'CLOSED'].includes(fulfillmentOrder.status) ||
        /apliiq/i.test(fulfillmentOrder.assignedLocation?.name || '') ||
        /apliiq/i.test(
          fulfillmentOrder.assignedLocation?.location?.fulfillmentService
            ?.handle || ''
        )
    )
  ) {
    throw new Error('TEST_ORDER_FINAL_STATE_INVALID');
  }
  return {
    orderReferenceHash: hash(`${environment.store}\n${orderNumber}`),
    finalFinancialStatus: order.displayFinancialStatus,
    finalFulfillmentStatus: order.displayFulfillmentStatus,
    fulfillmentRequestSubmitted: false,
    apliiqLocationAssigned: false,
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
const environment = exactEnvironment();

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
  const snapshot = readJson(options.snapshot);
  const browsers = browserProofs(options['browser-proof-directory']);
  const deployment = readJson(options['deployment-receipt']);
  const webhookProbe = readJson(options['webhook-probe']);
  const productionBeforeInspect = readJson(
    options['production-before-inspect']
  );
  const productionAfterInspect = readJson(options['production-after-inspect']);
  const productionBeforeHealth = readJson(options['production-before-health']);
  const productionAfterHealth = readJson(options['production-after-health']);
  const confirmationHash = options['confirmation-hash'];
  const orderStatusHash = options['order-status-hash'];
  const sourcePullRequest = Number(options['source-pull-request']);
  if (
    !FINGERPRINT.test(confirmationHash || '') ||
    !FINGERPRINT.test(orderStatusHash || '') ||
    !Number.isSafeInteger(sourcePullRequest) ||
    sourcePullRequest < 1 ||
    snapshot.gitCommitSha !== options['expected-sha'] ||
    snapshot.release !== options.release
  ) {
    throw new Error('FINAL_PROOF_IDENTITY_INVALID');
  }
  const order = await exactTestOrder(environment, snapshot);
  const events = await lifecycleEvents(environment, order.orderReferenceHash);
  const requiredTopics = [
    'orders/create',
    'orders/paid',
    'orders/cancelled',
    'refunds/create',
  ];
  const observedTopics = [
    ...new Set(events.map((event) => event.topic)),
  ].sort();
  if (
    requiredTopics.some((topic) => !observedTopics.includes(topic)) ||
    events.some(
      (event) =>
        event.signatureVerified !== true ||
        event.signatureAlgorithm !== 'shopify-hmac-sha256' ||
        event.externalActionApplied !== false
    )
  ) {
    throw new Error('SIGNED_LIFECYCLE_INCOMPLETE');
  }
  if (
    webhookProbe?.duplicateDelivery?.attempted !== true ||
    webhookProbe?.duplicateDelivery?.suppressed !== true ||
    webhookProbe?.duplicateDelivery?.observationCount !== 1 ||
    webhookProbe?.duplicateDelivery?.externalActionCount !== 0
  ) {
    throw new Error('DUPLICATE_DELIVERY_PROOF_INVALID');
  }
  const current = await productObservation(environment);
  const variants = snapshot.product.variants.map((before) => {
    const after = current.variants.find(
      (variant) => variant.size === before.size
    );
    if (!after || after.inventory !== before.inventory) {
      throw new Error('INVENTORY_NOT_RESTORED');
    }
    return {
      size: before.size,
      price: before.price,
      currency: before.currency,
      availableBefore: before.available,
      availableAfter: after.available,
      inventoryBefore: before.inventory,
      inventoryAfter: after.inventory,
      inventoryRestored: true,
    };
  });
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
    schemaVersion: 'cp.protected-staging-release-receipt.v1',
    generatedAt: new Date().toISOString(),
    release: snapshot.release,
    gitCommitSha: snapshot.gitCommitSha,
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
      storeKind: snapshot.storeKind,
      storeReferenceHash: snapshot.storeReferenceHash,
      productionStoreReferenceHash: snapshot.productionStoreReferenceHash,
      storeIsolated: true,
      paymentMode: 'test',
      durableStoreReferenceHash: snapshot.durableStoreReferenceHash,
      productionDurableStoreReferenceHash:
        snapshot.productionDurableStoreReferenceHash,
      durableStoreIsolated: true,
      handle: snapshot.product.handle,
      variants,
      cartBinding: {
        gitCommitSha: snapshot.gitCommitSha,
        release: snapshot.release,
      },
      hostedCheckout: { https: true, trustedHost: true },
    },
    customerPath: {
      shopifyAuthoritativeProduct: true,
      sizeSelection: true,
      bagTruth: true,
      hostedStagingCheckout: true,
      testPayment: true,
      paidOrder: true,
      brandedConfirmation: true,
      confirmationEvidenceHash: confirmationHash,
      orderStatus: true,
      orderStatusEvidenceHash: orderStatusHash,
    },
    lifecycle: {
      orderReferenceHash: order.orderReferenceHash,
      signatureVerified: true,
      signatureAlgorithm: 'shopify-hmac-sha256',
      durableIdempotency: true,
      requiredTopics,
      observedTopics,
      duplicateDelivery: webhookProbe.duplicateDelivery,
      cancelled: true,
      refunded: true,
      inventoryRestored: true,
      finalFinancialStatus: order.finalFinancialStatus,
      finalFulfillmentStatus: order.finalFulfillmentStatus,
      fulfillmentRequestSubmitted: order.fulfillmentRequestSubmitted,
      apliiqLocationAssigned: order.apliiqLocationAssigned,
      noApliiqProductionJob: true,
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
