const fs = require('fs');
const path = require('path');

const ADMIN_API_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || '2026-07';
const REPORT_DIR = path.resolve(__dirname, '../../..', 'test_reports/shopify-draft-guardrail');
const REVIEW_TAGS = ['needs-review', 'automation-test', 'carlophillips-pod-pipeline'];
const AUTOMATION_TAGS = ['automation-test', 'mydesigns-test', 'carlophillips-pod-pipeline'];
const PROTECTED_VENDORS = ['apliiq', 'printful', 'printify', 'shineon'];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadLocalEnv() {
  const projectRoot = path.resolve(__dirname, '../..');
  loadEnvFile(path.join(projectRoot, '.env.local'));
  loadEnvFile(path.join(projectRoot, '.env'));
}

function normalizeStoreDomain(domain) {
  return String(domain || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '');
}

function redactSecrets(value) {
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  let output = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  if (token) output = output.split(token).join('[REDACTED_SHOPIFY_ADMIN_ACCESS_TOKEN]');
  return output;
}

function getEnvReadiness() {
  loadLocalEnv();
  const storeDomain = normalizeStoreDomain(process.env.SHOPIFY_STORE_DOMAIN);
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';

  return {
    hasStoreDomain: Boolean(storeDomain),
    hasAdminAccessToken: Boolean(adminToken),
    apiVersion: ADMIN_API_VERSION,
    ready: Boolean(storeDomain && adminToken),
  };
}

function getAdminApiUrl() {
  const storeDomain = normalizeStoreDomain(process.env.SHOPIFY_STORE_DOMAIN);
  if (!storeDomain) {
    throw new Error('SHOPIFY_STORE_DOMAIN is required.');
  }
  return `https://${storeDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
}

async function shopifyAdminGraphql(query, variables = {}) {
  loadLocalEnv();
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!token) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is required.');
  }

  const response = await fetch(getAdminApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const responseText = await response.text();
  let payload;
  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    throw new Error(
      `Shopify Admin API returned non-JSON response (${response.status}): ${redactSecrets(responseText)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Shopify Admin API HTTP ${response.status}: ${redactSecrets(payload)}`
    );
  }

  if (payload.errors && payload.errors.length) {
    throw new Error(`Shopify GraphQL errors: ${redactSecrets(payload.errors)}`);
  }

  return payload.data;
}

function collectUserErrors(mutationPayload) {
  if (!mutationPayload || typeof mutationPayload !== 'object') return [];
  return Object.values(mutationPayload)
    .filter(Boolean)
    .flatMap((value) => Array.isArray(value.userErrors) ? value.userErrors : []);
}

function assertNoUserErrors(mutationPayload) {
  const userErrors = collectUserErrors(mutationPayload);
  if (userErrors.length) {
    throw new Error(`Shopify userErrors: ${redactSecrets(userErrors)}`);
  }
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      args._.push(arg);
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split('=');
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function getConfig(args = {}) {
  const lookbackMinutes = Number(args.lookbackMinutes || process.env.LOOKBACK_MINUTES || 60);
  const requiredCreatedAfter = args.createdAfter || process.env.REQUIRED_CREATED_AFTER || '';
  const createdAfter = requiredCreatedAfter
    ? new Date(requiredCreatedAfter)
    : new Date(Date.now() - lookbackMinutes * 60 * 1000);

  if (Number.isNaN(createdAfter.getTime())) {
    throw new Error(`Invalid created-after timestamp: ${requiredCreatedAfter}`);
  }

  return {
    lookbackMinutes,
    targetVendor: String(args.vendor || process.env.TARGET_VENDOR || 'MyDesigns'),
    targetTitleContains: String(
      args.titleContains || process.env.TARGET_TITLE_CONTAINS || 'CARLOPHILLIPS'
    ),
    requiredCreatedAfter: requiredCreatedAfter || null,
    createdAfterIso: createdAfter.toISOString(),
    allowOlder: Boolean(args.allowOlder),
    enforce: Boolean(args.enforce),
    limit: Number(args.limit || process.env.GUARDRAIL_QUERY_LIMIT || 100),
  };
}

function lower(value) {
  return String(value || '').toLowerCase();
}

function hasAnyTag(product, tags) {
  const productTags = (product.tags || []).map(lower);
  return tags.some((tag) => productTags.includes(lower(tag)));
}

function isProtectedVendor(product) {
  const vendor = lower(product.vendor);
  return PROTECTED_VENDORS.some((protectedVendor) => vendor.includes(protectedVendor));
}

function isOlderThanLookback(product, config) {
  return new Date(product.createdAt).getTime() < new Date(config.createdAfterIso).getTime();
}

function detectionReasons(product, config) {
  const reasons = [];
  if (lower(product.vendor) === lower(config.targetVendor)) reasons.push('vendor');
  if (lower(product.title).includes(lower(config.targetTitleContains))) reasons.push('title');
  if (hasAnyTag(product, AUTOMATION_TAGS)) reasons.push('automation_tag');
  if (product.launchStatusMetafield) reasons.push('launch_status_metafield');
  if (!isOlderThanLookback(product, config)) reasons.push('created_after');
  return reasons;
}

function safetyDecision(product, config) {
  const reasons = [];

  if (isProtectedVendor(product)) {
    return { canModify: false, reasons: ['protected_vendor'] };
  }

  if (isOlderThanLookback(product, config) && !config.allowOlder) {
    reasons.push('older_than_lookback');
  }

  const vendorMatches = lower(product.vendor) === lower(config.targetVendor);
  const hasAutomationTag = hasAnyTag(product, AUTOMATION_TAGS);

  if (!vendorMatches && !hasAutomationTag) {
    reasons.push('vendor_not_mydesigns_without_automation_tag');
  }

  return {
    canModify: reasons.length === 0,
    reasons: reasons.length ? reasons : ['matches_safety_criteria'],
  };
}

function needsGuardrailUpdate(product) {
  const missingTags = REVIEW_TAGS.filter((tag) => !(product.tags || []).map(lower).includes(lower(tag)));
  const launchStatus = product.launchStatusMetafield && product.launchStatusMetafield.value;
  return {
    needsDraft: product.status !== 'DRAFT',
    missingTags,
    needsMetafield: launchStatus !== 'needs_review',
    shouldModify: product.status !== 'DRAFT' || missingTags.length > 0 || launchStatus !== 'needs_review',
  };
}

function summarizeProduct(product, config) {
  const updateNeeds = needsGuardrailUpdate(product);
  const safety = safetyDecision(product, config);
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    vendor: product.vendor,
    status: product.status,
    createdAt: product.createdAt,
    tags: product.tags || [],
    launchStatus: product.launchStatusMetafield ? product.launchStatusMetafield.value : null,
    detectionReasons: detectionReasons(product, config),
    safety,
    updateNeeds,
  };
}

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  return REPORT_DIR;
}

function writeReport(fileName, report) {
  ensureReportDir();
  const filePath = path.join(REPORT_DIR, fileName);
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return filePath;
}

function printJson(value) {
  console.log(redactSecrets(value));
}

module.exports = {
  ADMIN_API_VERSION,
  AUTOMATION_TAGS,
  PROTECTED_VENDORS,
  REPORT_DIR,
  REVIEW_TAGS,
  assertNoUserErrors,
  getConfig,
  getEnvReadiness,
  hasAnyTag,
  needsGuardrailUpdate,
  parseArgs,
  printJson,
  redactSecrets,
  safetyDecision,
  shopifyAdminGraphql,
  summarizeProduct,
  writeReport,
};
