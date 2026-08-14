const minimumTokenLength = 32;

function constantTimeEqual(left, right) {
  const leftValue = String(left || '');
  const rightValue = String(right || '');
  const length = Math.max(leftValue.length, rightValue.length);
  let mismatch = leftValue.length ^ rightValue.length;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (leftValue.charCodeAt(index) || 0) ^ (rightValue.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

export function evaluateAdminAccess({
  authorization,
  expectedToken,
  expectedProductOwnerToken,
  reviewEnabled,
  runtimeSurface,
  requiredRole = null,
}) {
  if (runtimeSurface !== 'local') {
    return { allowed: false, reason: 'external_surface_denied' };
  }

  if (!reviewEnabled) {
    return { allowed: false, reason: 'review_mode_disabled' };
  }

  const [scheme, suppliedToken, ...extras] = String(authorization || '').trim().split(/\s+/);
  if (scheme !== 'Bearer' || !suppliedToken || extras.length > 0) {
    return { allowed: false, reason: 'invalid_authorization' };
  }

  const reviewTokenReady = Boolean(expectedToken && expectedToken.length >= minimumTokenLength);
  const ownerTokenReady = Boolean(
    expectedProductOwnerToken
    && expectedProductOwnerToken.length >= minimumTokenLength
  );
  const roleTokensAreDistinct = !reviewTokenReady
    || !ownerTokenReady
    || !constantTimeEqual(expectedToken, expectedProductOwnerToken);

  if (!roleTokensAreDistinct) {
    return { allowed: false, reason: 'role_tokens_must_be_distinct' };
  }

  if (ownerTokenReady && constantTimeEqual(suppliedToken, expectedProductOwnerToken)) {
    return {
      allowed: true,
      reason: 'local_product_owner_review',
      role: 'product_owner',
    };
  }

  if (requiredRole === 'product_owner') {
    return {
      allowed: false,
      reason: ownerTokenReady ? 'product_owner_required' : 'product_owner_token_unconfigured',
    };
  }

  if (!reviewTokenReady) {
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

export function resolveAdminRuntimeSurface({ vercelEnvironment, commerceEnvironment }) {
  if (vercelEnvironment) return `vercel-${vercelEnvironment}`;
  if (commerceEnvironment !== 'local') {
    return `commerce-${commerceEnvironment || 'unconfigured'}`;
  }
  return 'local';
}
