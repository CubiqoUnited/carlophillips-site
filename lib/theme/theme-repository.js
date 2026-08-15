import 'server-only';

import { execFileSync } from 'node:child_process';
import {
  atomicWriteTheme,
  prepareThemeWrite,
  readCanonicalTheme,
} from './theme-repository-core';
import { evaluateThemeWriteBoundary, themeWorkflowSteps } from './theme-workflow';
import { resolveAdminRuntimeSurface } from '@/lib/admin/access-policy';

function currentBranch(repositoryRoot) {
  try {
    return execFileSync('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

export function loadCanonicalTheme(projectRoot = process.cwd()) {
  const { repositoryRoot, theme, fingerprint } = readCanonicalTheme(projectRoot);
  const branch = currentBranch(repositoryRoot);
  return {
    theme,
    fingerprint,
    workflow: {
      branch,
      steps: themeWorkflowSteps,
      productionMutation: false,
      writeEnabled: evaluateThemeWriteBoundary({
        runtimeSurface: resolveAdminRuntimeSurface({
          vercelEnvironment: process.env.VERCEL_ENV,
          commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
        }),
        commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
        writeEnabled: process.env.CP_ADMIN_THEME_WRITES_ENABLED === 'true',
        branch,
      }).allowed,
    },
  };
}

export function saveThemeCandidate({ candidate, expectedFingerprint }, projectRoot = process.cwd()) {
  const { repositoryRoot, target, theme: currentTheme } = readCanonicalTheme(projectRoot);
  const branch = currentBranch(repositoryRoot);
  const runtimeSurface = resolveAdminRuntimeSurface({
    vercelEnvironment: process.env.VERCEL_ENV,
    commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
  });
  const boundary = evaluateThemeWriteBoundary({
    runtimeSurface,
    commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
    writeEnabled: process.env.CP_ADMIN_THEME_WRITES_ENABLED === 'true',
    branch,
  });
  if (!boundary.allowed) {
    return { ok: false, status: 403, code: boundary.reason.toUpperCase() };
  }

  const prepared = prepareThemeWrite({ candidate, currentTheme, expectedFingerprint });
  if (!prepared.ok || prepared.code === 'THEME_UNCHANGED') {
    return {
      ...prepared,
      branch,
      workflow: themeWorkflowSteps,
      productionMutation: false,
    };
  }
  atomicWriteTheme(target, prepared.serialized);

  return {
    ...prepared,
    serialized: undefined,
    branch,
    workflow: themeWorkflowSteps,
    productionMutation: false,
  };
}
