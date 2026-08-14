export const themeWorkflowSteps = Object.freeze([
  'Save the validated theme.json candidate on a temporary codex/* branch.',
  'Run lint, focused tests, the full test suite, build, and desktop/mobile visual comparison.',
  'Commit the reviewed diff and open a pull request into main.',
  'Inspect the immutable Vercel Preview and its quality checks.',
  'Obtain Product Owner approval before merge; Production remains a separate approval.',
]);

export function evaluateThemeWriteBoundary({
  runtimeSurface,
  commerceEnvironment,
  writeEnabled,
  branch,
}) {
  if (runtimeSurface !== 'local') {
    return { allowed: false, reason: 'external_surface_denied' };
  }
  if (commerceEnvironment !== 'local') {
    return { allowed: false, reason: 'commerce_environment_denied' };
  }
  if (!writeEnabled) {
    return { allowed: false, reason: 'theme_writes_disabled' };
  }
  if (!branch || !branch.startsWith('codex/')) {
    return { allowed: false, reason: 'temporary_feature_branch_required' };
  }
  return { allowed: true, reason: 'local_feature_branch_candidate' };
}

export function isSameOriginRequest(requestUrl, origin) {
  if (!origin) return false;
  try {
    const target = new URL(requestUrl);
    const supplied = new URL(origin);
    return supplied.origin === target.origin;
  } catch {
    return false;
  }
}
