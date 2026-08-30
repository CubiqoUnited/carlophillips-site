import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import theme from '../theme.json';
import {
  contrastRatio,
  serializeTheme,
  themeKeys,
  validateTheme,
} from '../lib/theme/theme-contract';
import { buildThemeCss, themePrimitiveEntries } from '../lib/theme/theme-css';
import {
  atomicWriteTheme,
  parseThemeDocument,
  prepareThemeWrite,
  resolveCanonicalThemeTarget,
  themeFingerprint,
} from '../lib/theme/theme-repository-core';
import {
  evaluateThemeWriteBoundary,
  isSameOriginRequest,
} from '../lib/theme/theme-workflow';
import {
  loadCanonicalTheme,
  saveThemeCandidate,
} from '../lib/theme/theme-repository';

vi.mock('server-only', () => ({}));

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(?:css|js|jsx)$/.test(entry.name) ? [target] : [];
  });
}

describe('canonical theme token governance', () => {
  it('keeps exactly four validated values in one canonical repository file', () => {
    expect(Object.keys(theme).sort()).toEqual([...themeKeys].sort());
    expect(validateTheme(theme)).toMatchObject({ ok: true, theme });
    expect(serializeTheme(theme)).toBe(readFileSync('theme.json', 'utf8'));

    for (const invalid of [
      { ...theme, layout: 'grid' },
      { ...theme, accentColor: '#111111' },
      { ...theme, accentColor: 'red' },
      { ...theme, cornerRadius: '2rem' },
      { ...theme, baseSpacing: '4rem' },
      { ...theme, textWeight: 900 },
    ])
      expect(validateTheme(invalid).ok).toBe(false);
    expect(parseThemeDocument('{broken').errors).toContain(
      'Theme JSON is malformed.'
    );
  });

  it('enforces deterministic accent contrast on both canonical dark canvases', () => {
    expect(contrastRatio(theme.accentColor, '#000000')).toBeGreaterThanOrEqual(
      4.5
    );
    expect(contrastRatio(theme.accentColor, '#020202')).toBeGreaterThanOrEqual(
      4.5
    );
    expect(validateTheme({ ...theme, accentColor: '#767676' }).ok).toBe(true);
    expect(validateTheme({ ...theme, accentColor: '#6f6f6f' }).ok).toBe(false);
  });

  it('reproduces the exact default storefront values while deriving the full spacing scale', () => {
    const entries = Object.fromEntries(themePrimitiveEntries(theme));
    expect(entries).toMatchObject({
      '--cp-primitive-color-accent': '#ffffff',
      '--cp-primitive-font-weight-light': '300',
      '--cp-primitive-radius-none': '0rem',
      '--cp-primitive-space-025': '0.25rem',
      '--cp-primitive-space-100': '1rem',
      '--cp-primitive-space-800': '8rem',
      '--cp-primitive-space-negative-050': '-0.5rem',
    });
    // Only negative offsets an active surface consumes are emitted; a dormant token is a blocker.
    expect(entries).not.toHaveProperty('--cp-primitive-space-negative-200');
    const css = buildThemeCss(theme);
    expect(css).toContain('--cp-primitive-color-accent: #ffffff');
    expect(readFileSync('app/design-tokens.css', 'utf8')).not.toMatch(
      /--cp-primitive-(?:font-weight-light|radius-none|space-100):\s*(?:300|0|1rem)/
    );
  });

  it('rejects stale writes, accepts unchanged writes, and prepares only validated changes', () => {
    const fingerprint = themeFingerprint(theme);
    expect(
      prepareThemeWrite({
        candidate: theme,
        currentTheme: theme,
        expectedFingerprint: fingerprint,
      })
    ).toMatchObject({ ok: true, code: 'THEME_UNCHANGED', fingerprint });
    expect(
      prepareThemeWrite({
        candidate: theme,
        currentTheme: theme,
        expectedFingerprint: `sha256:${'0'.repeat(64)}`,
      })
    ).toMatchObject({ ok: false, status: 409, code: 'THEME_REVISION_STALE' });
    expect(
      prepareThemeWrite({
        candidate: { ...theme, textWeight: 400 },
        currentTheme: theme,
        expectedFingerprint: fingerprint,
      })
    ).toMatchObject({ ok: true, code: 'THEME_BRANCH_PROPOSAL_SAVED' });
    expect(
      prepareThemeWrite({
        candidate: { ...theme, baseSpacing: '9rem' },
        currentTheme: theme,
        expectedFingerprint: fingerprint,
      })
    ).toMatchObject({
      ok: false,
      status: 422,
      code: 'THEME_VALIDATION_FAILED',
    });
  });

  it('allows writes only on a local codex branch and rejects CSRF/external surfaces', () => {
    const base = {
      runtimeSurface: 'local',
      commerceEnvironment: 'local',
      writeEnabled: true,
      branch: 'codex/cp-admin-theme-tokens',
    };
    expect(evaluateThemeWriteBoundary(base).allowed).toBe(true);
    expect(evaluateThemeWriteBoundary({ ...base, branch: 'main' }).reason).toBe(
      'temporary_feature_branch_required'
    );
    expect(
      evaluateThemeWriteBoundary({ ...base, writeEnabled: false }).reason
    ).toBe('theme_writes_disabled');
    expect(
      evaluateThemeWriteBoundary({ ...base, runtimeSurface: 'vercel-preview' })
        .reason
    ).toBe('external_surface_denied');
    expect(
      evaluateThemeWriteBoundary({
        ...base,
        runtimeSurface: 'vercel-production',
      }).reason
    ).toBe('external_surface_denied');
    expect(
      evaluateThemeWriteBoundary({ ...base, commerceEnvironment: 'production' })
        .reason
    ).toBe('commerce_environment_denied');

    const url = 'http://127.0.0.1:3000/api/admin/theme';
    expect(isSameOriginRequest(url, 'http://127.0.0.1:3000')).toBe(true);
    expect(isSameOriginRequest(url, 'https://127.0.0.1:3000')).toBe(false);
    expect(isSameOriginRequest(url, 'http://localhost:3000')).toBe(false);
    expect(isSameOriginRequest(url, 'https://evil.example')).toBe(false);
    expect(isSameOriginRequest(url, null)).toBe(false);
  });

  it('packages the canonical theme for server functions and denies remote writes before filesystem access', () => {
    const nextConfig = readFileSync('next.config.js', 'utf8');
    expect(nextConfig).toContain("'/*': ['./theme.json']");

    const repository = readFileSync('lib/theme/theme-repository.js', 'utf8');
    expect(repository).toContain(
      "import bundledCanonicalTheme from '../../theme.json'"
    );
    expect(repository).toContain("runtimeSurface === 'vercel-preview'");
    expect(repository).toContain('theme: bundledThemeValidation.theme');
    const saveThemeCandidate = repository.slice(
      repository.indexOf('export function saveThemeCandidate')
    );
    expect(saveThemeCandidate.indexOf('if (!boundary.allowed)')).toBeLessThan(
      saveThemeCandidate.indexOf('readCanonicalTheme(projectRoot)')
    );
  });

  it('loads the bundled theme and denies writes without touching a missing Preview filesystem', () => {
    const previousVercelEnvironment = process.env.VERCEL_ENV;
    const previousCommerceEnvironment =
      process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT;
    process.env.VERCEL_ENV = 'preview';
    process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT = 'preview';
    try {
      const missingRoot = path.join(
        tmpdir(),
        'cp-theme-root-that-does-not-exist'
      );
      expect(loadCanonicalTheme(missingRoot)).toMatchObject({
        theme,
        fingerprint: themeFingerprint(theme),
        workflow: {
          branch: null,
          writeEnabled: false,
          productionMutation: false,
        },
      });
      expect(
        saveThemeCandidate(
          { candidate: theme, expectedFingerprint: themeFingerprint(theme) },
          missingRoot
        )
      ).toEqual({ ok: false, status: 403, code: 'EXTERNAL_SURFACE_DENIED' });
    } finally {
      if (previousVercelEnvironment === undefined)
        delete process.env.VERCEL_ENV;
      else process.env.VERCEL_ENV = previousVercelEnvironment;
      if (previousCommerceEnvironment === undefined)
        delete process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT;
      else
        process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT =
          previousCommerceEnvironment;
    }
  });

  it('rejects a symlinked canonical file and cannot resolve a caller-selected target path', () => {
    const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'cp-theme-policy-'));
    const outsideRoot = path.join(temporaryRoot, 'outside');
    const repositoryRoot = path.join(temporaryRoot, 'repository');
    mkdirSync(outsideRoot);
    mkdirSync(repositoryRoot);
    writeFileSync(path.join(outsideRoot, 'theme.json'), serializeTheme(theme));
    symlinkSync(
      path.join(outsideRoot, 'theme.json'),
      path.join(repositoryRoot, 'theme.json')
    );
    try {
      expect(() => resolveCanonicalThemeTarget(repositoryRoot)).toThrow(
        'THEME_TARGET_MUST_NOT_BE_A_SYMLINK'
      );
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
    expect(resolveCanonicalThemeTarget.length).toBe(1);
  });

  it('atomically replaces only the canonical file with a validated serialization', () => {
    const repositoryRoot = mkdtempSync(path.join(tmpdir(), 'cp-theme-write-'));
    const target = path.join(repositoryRoot, 'theme.json');
    writeFileSync(target, serializeTheme(theme));
    try {
      const proposedTheme = { ...theme, cornerRadius: '0.5rem' };
      const resolvedRoot = realpathSync(repositoryRoot);
      const locations = resolveCanonicalThemeTarget(repositoryRoot);
      expect(locations).toEqual({
        repositoryRoot: resolvedRoot,
        target: path.join(resolvedRoot, 'theme.json'),
      });
      atomicWriteTheme(locations.target, serializeTheme(proposedTheme));
      expect(readFileSync(locations.target, 'utf8')).toBe(
        serializeTheme(proposedTheme)
      );
      expect(readdirSync(repositoryRoot)).toEqual(['theme.json']);
    } finally {
      rmSync(repositoryRoot, { recursive: true, force: true });
    }
  });

  it('extends hardcoded-value enforcement across every active app and component source', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(packageJson.scripts.lint).toContain('lint:design-system');
    expect(readFileSync('scripts/lint-design-system.mjs', 'utf8')).toContain(
      'Design-system lint failed'
    );
    const files = [...sourceFiles('app'), ...sourceFiles('components')].filter(
      (file) =>
        !['app/design-tokens.css', 'app/opengraph-image.js'].includes(file)
    );
    const violations = [];
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      if (/#[0-9a-f]{3,8}\b|rgba?\(/i.test(source))
        violations.push(`${file}: raw colour`);
      for (const match of source.matchAll(
        /(?:border-radius|font-weight|(?:margin|padding|gap)(?:-[a-z]+)?):\s*([^;]+);/g
      )) {
        if (!match[1].includes('var(--cp-'))
          violations.push(`${file}: ${match[0]}`);
      }
    }
    expect(violations).toEqual([]);

    const editor = readFileSync('components/admin/theme-editor.jsx', 'utf8');
    expect(editor).toContain(
      "'--cp-theme-preview-accent': proposed.accentColor"
    );
    expect(editor).not.toMatch(
      /(?:accentColor|cornerRadius|baseSpacing|textWeight):\s*(?:['"](?:#|\d)|\d)/
    );
    expect(
      readFileSync('components/admin/control-plane.jsx', 'utf8')
    ).toContain('<Status value="branch_proposal" />');
    expect(readFileSync('app/admin/admin.module.css', 'utf8')).not.toMatch(
      /\.status[^}]*color-accent/s
    );
  });

  it('keeps Tailwind removed and binds any future adapter to the same JSON authority', () => {
    expect(() => readFileSync('tailwind.config.js', 'utf8')).toThrow();
    expect(readFileSync('docs/design-system.md', 'utf8')).toContain(
      'future Tailwind adapter'
    );
    expect(readFileSync('docs/design-system.md', 'utf8')).toContain(
      'theme.json'
    );
  });
});
