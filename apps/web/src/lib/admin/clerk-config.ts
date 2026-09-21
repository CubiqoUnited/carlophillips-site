export const adminClerkEnvironmentNames = Object.freeze([
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CP_ADMIN_PRODUCT_OWNER_USER_ID',
]);

const publishableKeyPattern = /^pk_(?:test|live)_[A-Za-z0-9_-]+$/;
const secretKeyPattern = /^sk_(?:test|live)_[A-Za-z0-9_-]+$/;
const userIdPattern = /^user_[A-Za-z0-9_-]+$/;

/**
 * KAN-23 root cause. Next.js replaces `process.env.NEXT_PUBLIC_*` only where it
 * appears as that literal member expression, at build time. Reading the same
 * name off an injected `environment` object defeats the substitution, so this
 * guard was resolving the RUNTIME value while @clerk/nextjs resolved its
 * BUILD-INLINED constant. When the two disagreed the guard said "ready" about an
 * artifact that could not serve, and Clerk threw its configuration error at the
 * edge. This module-scope constant is the inlined read, and it is the default.
 *
 * The secret is deliberately NOT inlined: it stays a runtime lookup so it is
 * never compiled into a client or edge bundle (AC-ADM-1, R-ADM-3).
 */
const inlinedPublishableKey = String(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
).trim();

export function resolveAdminClerkConfiguration(
  environment?: NodeJS.ProcessEnv | Record<string, string | undefined>
) {
  // An explicit argument is a TEST OVERRIDE ONLY. The default path must never
  // route the publishable key through it, or KAN-23 returns.
  const overridden = environment !== undefined;
  const source = environment ?? process.env;

  const publishableKey = overridden
    ? String(source.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '').trim()
    : inlinedPublishableKey;
  const secretKey = String(source.CLERK_SECRET_KEY || '').trim();
  const productOwnerUserId = String(
    source.CP_ADMIN_PRODUCT_OWNER_USER_ID || ''
  ).trim();

  const publishableKeyReady = publishableKeyPattern.test(publishableKey);
  const secretKeyReady = secretKeyPattern.test(secretKey);
  const productOwnerIdentityReady = userIdPattern.test(productOwnerUserId);

  let reason = 'ready';
  if (!publishableKeyReady || !secretKeyReady) {
    reason = 'clerk_keys_unconfigured';
  } else if (!productOwnerIdentityReady) {
    reason = 'product_owner_identity_unconfigured';
  }

  return {
    ready: reason === 'ready',
    reason,
    productOwnerUserId: productOwnerIdentityReady ? productOwnerUserId : null,
  };
}
