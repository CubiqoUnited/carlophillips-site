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
  reviewEnabled,
  runtimeSurface,
}) {
  if (runtimeSurface !== 'local') {
    return { allowed: false, reason: 'external_surface_denied' };
  }

  if (!reviewEnabled) {
    return { allowed: false, reason: 'review_mode_disabled' };
  }

  if (!expectedToken || expectedToken.length < minimumTokenLength) {
    return { allowed: false, reason: 'review_token_unconfigured' };
  }

  const [scheme, suppliedToken, ...extras] = String(authorization || '').trim().split(/\s+/);
  if (scheme !== 'Bearer' || !suppliedToken || extras.length > 0) {
    return { allowed: false, reason: 'invalid_authorization' };
  }

  if (!constantTimeEqual(suppliedToken, expectedToken)) {
    return { allowed: false, reason: 'invalid_authorization' };
  }

  return { allowed: true, reason: 'local_read_only_review' };
}
