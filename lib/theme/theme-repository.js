import 'server-only';

import { execFileSync } from 'node:child_process';
import bundledCanonicalTheme from '../../theme.json';
import {
  atomicWriteTheme,
  prepareThemeWrite,
  readCanonicalTheme,
  themeFingerprint,
} from './theme-repository-core';
import { validateTheme } from './theme-contract';
import { evaluateThemeWriteBoundary, themeWorkflowSteps } from './theme-workflow';
import { resolveAdminRuntimeSurface } from '../admin/access-policy';

const bundledThemeValidation = validateTheme(bundledCanonicalTheme);
if (!bundledThemeValidation.ok) {
  throw new Error(`INVALID_BUNDLED_THEME: ${bundledThemeValidation.errors.join(' ')}`);
}

function isVercelRuntime(runtimeSurface) {
  return runtimeSurface === 'vercel-preview' || runtimeSurface === 'vercel-production';
}

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
  const runtimeSurface = resolveAdminRuntimeSurface({
    vercelEnvironment: process.env.VERCEL_ENV,
    commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
  });
  const canonical = isVercelRuntime(runtimeSurface)
    ? {
        theme: bundledThemeValidation.theme,
        fingerprint: themeFingerprint(bundledThemeValidation.theme),
      }
    : readCanonicalTheme(projectRoot);
  const branch = isVercelRuntime(runtimeSurface) ? null : currentBranch(canonical.repositoryRoot);
  return {
    theme: canonical.theme,
    fingerprint: canonical.fingerprint,
    workflow: {
      branch,
      steps: themeWorkflowSteps,
      productionMutation: false,
      writeEnabled: evaluateThemeWriteBoundary({
        runtimeSurface,
        commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
        writeEnabled: process.env.CP_ADMIN_THEME_WRITES_ENABLED === 'true',
        branch,
      }).allowed,
    },
  };
}

export function saveThemeCandidate({ candidate, expectedFingerprint }, projectRoot = process.cwd()) {
  const runtimeSurface = resolveAdminRuntimeSurface({
    vercelEnvironment: process.env.VERCEL_ENV,
    commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
  });
  const branch = isVercelRuntime(runtimeSurface) ? null : currentBranch(projectRoot);
  const boundary = evaluateThemeWriteBoundary({
    runtimeSurface,
    commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
    writeEnabled: process.env.CP_ADMIN_THEME_WRITES_ENABLED === 'true',
    branch,
  });
  if (!boundary.allowed) {
    return { ok: false, status: 403, code: boundary.reason.toUpperCase() };
  }

  const { target, theme: currentTheme } = readCanonicalTheme(projectRoot);
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
