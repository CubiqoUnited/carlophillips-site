import { createHash } from 'node:crypto';
import {
  lstatSync,
  readFileSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { serializeTheme, validateTheme } from './theme-contract';

export function themeFingerprint(candidate) {
  const serialized = serializeTheme(candidate);
  return `sha256:${createHash('sha256').update(serialized).digest('hex')}`;
}

export function parseThemeDocument(serialized) {
  let parsed;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return { ok: false, errors: ['Theme JSON is malformed.'], theme: null };
  }
  return validateTheme(parsed);
}

export function resolveCanonicalThemeTarget(projectRoot) {
  const repositoryRoot = realpathSync(projectRoot);
  const target = path.join(repositoryRoot, 'theme.json');
  if (lstatSync(target).isSymbolicLink()) {
    throw new Error('THEME_TARGET_MUST_NOT_BE_A_SYMLINK');
  }
  if (path.dirname(realpathSync(target)) !== repositoryRoot) {
    throw new Error('THEME_TARGET_OUTSIDE_REPOSITORY');
  }
  return { repositoryRoot, target };
}

export function readCanonicalTheme(projectRoot) {
  const locations = resolveCanonicalThemeTarget(projectRoot);
  const result = parseThemeDocument(readFileSync(locations.target, 'utf8'));
  if (!result.ok) throw new Error(`INVALID_CANONICAL_THEME: ${result.errors.join(' ')}`);
  return {
    ...locations,
    theme: result.theme,
    fingerprint: themeFingerprint(result.theme),
  };
}

export function prepareThemeWrite({ candidate, currentTheme, expectedFingerprint }) {
  const validation = validateTheme(candidate);
  if (!validation.ok) {
    return { ok: false, status: 422, code: 'THEME_VALIDATION_FAILED', errors: validation.errors };
  }
  const currentFingerprint = themeFingerprint(currentTheme);
  if (!expectedFingerprint || expectedFingerprint !== currentFingerprint) {
    return {
      ok: false,
      status: 409,
      code: 'THEME_REVISION_STALE',
      currentFingerprint,
    };
  }
  const nextFingerprint = themeFingerprint(validation.theme);
  if (nextFingerprint === currentFingerprint) {
    return { ok: true, status: 200, code: 'THEME_UNCHANGED', fingerprint: currentFingerprint };
  }
  return {
    ok: true,
    status: 200,
    code: 'THEME_BRANCH_PROPOSAL_SAVED',
    fingerprint: nextFingerprint,
    serialized: serializeTheme(validation.theme),
  };
}

export function atomicWriteTheme(target, serialized) {
  const repositoryRoot = path.dirname(target);
  const temporaryPath = path.join(
    repositoryRoot,
    `.theme.json.${process.pid}.${Date.now()}.tmp`
  );
  try {
    writeFileSync(temporaryPath, serialized, { encoding: 'utf8', flag: 'wx', mode: 0o644 });
    renameSync(temporaryPath, target);
  } catch (error) {
    try {
      unlinkSync(temporaryPath);
    } catch {
      // The temporary file may not exist; the canonical target is never removed.
    }
    throw error;
  }
}
