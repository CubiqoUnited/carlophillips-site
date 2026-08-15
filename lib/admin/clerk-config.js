export const adminClerkEnvironmentNames = Object.freeze([
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CP_ADMIN_PRODUCT_OWNER_USER_ID',
]);

const publishableKeyPattern = /^pk_(?:test|live)_[A-Za-z0-9_-]+$/;
const secretKeyPattern = /^sk_(?:test|live)_[A-Za-z0-9_-]+$/;
const userIdPattern = /^user_[A-Za-z0-9_-]+$/;

export function resolveAdminClerkConfiguration(environment = process.env) {
  const publishableKey = String(environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '').trim();
  const secretKey = String(environment.CLERK_SECRET_KEY || '').trim();
  const productOwnerUserId = String(environment.CP_ADMIN_PRODUCT_OWNER_USER_ID || '').trim();

  const publishableKeyReady = publishableKeyPattern.test(publishableKey);
  const secretKeyReady = secretKeyPattern.test(secretKey);
  const productOwnerIdentityReady = userIdPattern.test(productOwnerUserId);

  let reason = 'ready';
  if (!publishableKeyReady || !secretKeyReady) reason = 'clerk_keys_unconfigured';
  else if (!productOwnerIdentityReady) reason = 'product_owner_identity_unconfigured';

  return {
    ready: reason === 'ready',
    reason,
    productOwnerUserId: productOwnerIdentityReady ? productOwnerUserId : null,
  };
}
