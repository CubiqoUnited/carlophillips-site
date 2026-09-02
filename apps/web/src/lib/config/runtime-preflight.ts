import type { CommerceEnvironment } from '../commerce/runtime-types';

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

export type RuntimePreflightResult =
  | { ok: true; environment: CommerceEnvironment }
  | { ok: false; environment: CommerceEnvironment; errors: string[] };

function present(value: string | undefined) {
  return Boolean(value?.trim());
}

function normalizedShop(value: string | undefined) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

function requireNames(
  env: RuntimeEnvironment,
  names: string[],
  errors: string[]
) {
  for (const name of names) {
    if (!present(env[name])) errors.push(`RUNTIME_CONFIG_MISSING_${name}`);
  }
}

export function evaluateRuntimePreflight(
  environment: CommerceEnvironment,
  env: RuntimeEnvironment
): RuntimePreflightResult {
  if (environment === 'local') return { ok: true, environment };

  const preview = environment === 'preview';
  const prefix = preview ? 'SHOPIFY_STAGING_' : 'SHOPIFY_';
  const errors: string[] = [];
  const required = [
    'CP_COMMERCE_ENVIRONMENT',
    'CP_DURABLE_STORE_ID',
    `${prefix}STORE_DOMAIN`,
    `${prefix}STOREFRONT_TOKEN`,
    `${prefix}CHECKOUT_HOSTS`,
    `${prefix}WEBHOOK_SECRET`,
    'SHOPIFY_WEBHOOK_ALLOWED_SHOPS',
  ];
  requireNames(env, required, errors);

  if (env.CP_COMMERCE_ENVIRONMENT !== environment) {
    errors.push('RUNTIME_CONFIG_COMMERCE_ENVIRONMENT_MISMATCH');
  }
  if (env.SHOPIFY_CART_UI_ENABLED !== 'true') {
    errors.push('RUNTIME_CONFIG_CART_NOT_ENABLED');
  }
  if (env.SHOPIFY_CHECKOUT_ENABLED !== 'true') {
    errors.push('RUNTIME_CONFIG_CHECKOUT_NOT_ENABLED');
  }

  const expectedStoreId = preview
    ? env.CP_EXPECTED_PREVIEW_DURABLE_STORE_ID
    : env.CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID;
  const expectedStoreIdName = preview
    ? 'CP_EXPECTED_PREVIEW_DURABLE_STORE_ID'
    : 'CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID';
  if (!present(expectedStoreId)) {
    errors.push(`RUNTIME_CONFIG_MISSING_${expectedStoreIdName}`);
  } else if (env.CP_DURABLE_STORE_ID !== expectedStoreId) {
    errors.push('RUNTIME_CONFIG_DURABLE_STORE_ID_MISMATCH');
  }

  const hasKv = present(env.KV_REST_API_URL) && present(env.KV_REST_API_TOKEN);
  const hasUpstash =
    present(env.UPSTASH_REDIS_REST_URL) &&
    present(env.UPSTASH_REDIS_REST_TOKEN);
  if (!hasKv && !hasUpstash) {
    errors.push('RUNTIME_CONFIG_DURABLE_STORE_CREDENTIALS_MISSING');
  }

  const storeDomain = normalizedShop(env[`${prefix}STORE_DOMAIN`]);
  const allowedShops = (env.SHOPIFY_WEBHOOK_ALLOWED_SHOPS || '')
    .split(',')
    .map(normalizedShop)
    .filter(Boolean);
  if (
    storeDomain &&
    (allowedShops.length !== 1 || allowedShops[0] !== storeDomain)
  ) {
    errors.push('RUNTIME_CONFIG_ALLOWED_SHOP_MISMATCH');
  }

  return errors.length
    ? { ok: false, environment, errors: [...new Set(errors)].sort() }
    : { ok: true, environment };
}

export function assertRuntimePreflight(
  environment: CommerceEnvironment,
  env: RuntimeEnvironment = process.env
) {
  const result = evaluateRuntimePreflight(environment, env);
  if (!result.ok) throw new Error(result.errors.join(','));
  return result;
}
