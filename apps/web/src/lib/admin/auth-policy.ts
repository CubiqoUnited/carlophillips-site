export type AdminRuntimeSurface =
  | 'local'
  | 'vercel-preview'
  | 'vercel-production'
  | `vercel-${string}`
  | `commerce-${string}`;

export type AdminAccessDecision =
  | {
      allowed: true;
      reason:
        | 'local_read_only_review'
        | 'local_product_owner_review'
        | 'remote_product_owner_session';
      role: 'reviewer' | 'product_owner';
    }
  | { allowed: false; reason: string };

const minimumTokenLength = 32;

function constantTimeEqual(left: unknown, right: unknown) {
  const leftValue = String(left || '');
  const rightValue = String(right || '');
  const length = Math.max(leftValue.length, rightValue.length);
  let mismatch = leftValue.length ^ rightValue.length;

  for (let index = 0; index < length; index += 1) {
    mismatch |=
      (leftValue.charCodeAt(index) || 0) ^ (rightValue.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

export function resolveAdminRuntimeSurface({
  vercelEnvironment,
  commerceEnvironment,
}: {
  vercelEnvironment?: string | null;
  commerceEnvironment?: string | null;
}): AdminRuntimeSurface {
  if (vercelEnvironment) return `vercel-${vercelEnvironment}`;
  if (commerceEnvironment !== 'local') {
    return `commerce-${commerceEnvironment || 'unconfigured'}`;
  }
  return 'local';
}

export function evaluateLocalAdminAccess({
  authorization,
  expectedToken,
  expectedProductOwnerToken,
  reviewEnabled,
  runtimeSurface,
  requiredRole = null,
}: {
  authorization?: string | null;
  expectedToken?: string | null;
  expectedProductOwnerToken?: string | null;
  reviewEnabled: boolean;
  runtimeSurface: AdminRuntimeSurface;
  requiredRole?: 'product_owner' | null;
}): AdminAccessDecision {
  if (runtimeSurface !== 'local') {
    return { allowed: false, reason: 'external_surface_denied' };
  }
  if (!reviewEnabled) {
    return { allowed: false, reason: 'review_mode_disabled' };
  }

  const [scheme, suppliedToken, ...extras] = String(authorization || '')
    .trim()
    .split(/\s+/);
  if (scheme !== 'Bearer' || !suppliedToken || extras.length > 0) {
    return { allowed: false, reason: 'invalid_authorization' };
  }

  const reviewerReady = Boolean(
    expectedToken && expectedToken.length >= minimumTokenLength
  );
  const ownerReady = Boolean(
    expectedProductOwnerToken &&
    expectedProductOwnerToken.length >= minimumTokenLength
  );
  if (
    reviewerReady &&
    ownerReady &&
    constantTimeEqual(expectedToken, expectedProductOwnerToken)
  ) {
    return { allowed: false, reason: 'role_tokens_must_be_distinct' };
  }

  if (
    ownerReady &&
    constantTimeEqual(suppliedToken, expectedProductOwnerToken)
  ) {
    return {
      allowed: true,
      reason: 'local_product_owner_review',
      role: 'product_owner',
    };
  }
  if (requiredRole === 'product_owner') {
    return {
      allowed: false,
      reason: ownerReady
        ? 'product_owner_required'
        : 'product_owner_token_unconfigured',
    };
  }
  if (!reviewerReady) {
    return { allowed: false, reason: 'review_token_unconfigured' };
  }
  if (!constantTimeEqual(suppliedToken, expectedToken)) {
    return { allowed: false, reason: 'invalid_authorization' };
  }

  return {
    allowed: true,
    reason: 'local_read_only_review',
    role: 'reviewer',
  };
}

export function evaluateRemoteProductOwnerAccess({
  authenticatedUserId,
  expectedProductOwnerUserId,
  identityProviderReady,
  runtimeSurface,
}: {
  authenticatedUserId?: string | null;
  expectedProductOwnerUserId?: string | null;
  identityProviderReady: boolean;
  runtimeSurface: AdminRuntimeSurface;
}): AdminAccessDecision {
  if (!['vercel-preview', 'vercel-production'].includes(runtimeSurface)) {
    return { allowed: false, reason: 'external_surface_denied' };
  }
  if (!identityProviderReady) {
    return { allowed: false, reason: 'identity_provider_unconfigured' };
  }
  if (!expectedProductOwnerUserId) {
    return { allowed: false, reason: 'product_owner_identity_unconfigured' };
  }
  if (!authenticatedUserId) {
    return { allowed: false, reason: 'authenticated_session_required' };
  }
  if (!constantTimeEqual(authenticatedUserId, expectedProductOwnerUserId)) {
    return { allowed: false, reason: 'product_owner_required' };
  }

  return {
    allowed: true,
    reason: 'remote_product_owner_session',
    role: 'product_owner',
  };
}
