import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import packageDocument from '../package.json';

describe('tooling and supported-runtime policy', () => {
  it('pins the verified supported framework and React runtime', () => {
    expect(packageDocument.dependencies.next).toBe('15.5.21');
    expect(packageDocument.dependencies.react).toBe('19.2.8');
    expect(packageDocument.dependencies['react-dom']).toBe('19.2.8');
  });

  it('keeps the repository Yarn-only', () => {
    expect(packageDocument.packageManager).toMatch(/^yarn@1\.22\.22/);
    expect(existsSync('package-lock.json')).toBe(false);
    expect(existsSync('pnpm-lock.yaml')).toBe(false);
  });

  it('records temporary patched transitive security resolutions', () => {
    expect(packageDocument.resolutions).toMatchObject({
      lodash: '4.18.1',
      postcss: '8.5.25',
      sharp: '0.35.3',
    });
    expect(packageDocument.dependencies.axios).toBeUndefined();
    expect(packageDocument.dependencies.uuid).toBeUndefined();
  });

  it('audits exact Yarn production versions against reviewed advisories', () => {
    const auditRunner = readFileSync(
      'scripts/audit-production-dependencies.mjs',
      'utf8'
    );

    expect(packageDocument.scripts['audit:prod']).toBe(
      'node scripts/audit-production-dependencies.mjs'
    );
    expect(auditRunner).toContain(
      "rootManifest.packageManager?.startsWith('yarn@1.22.22')"
    );
    expect(auditRunner).toContain(
      "existsSync(join(rootDirectory, 'yarn.lock'))"
    );
    expect(auditRunner).toContain('findInstalledManifest');
    expect(auditRunner).toContain('https://api.github.com/advisories');
    expect(auditRunner).toContain("url.searchParams.set('type', 'reviewed')");
    expect(auditRunner).toContain("'medium', 'moderate', 'high', 'critical'");
    expect(auditRunner).toContain('const attempts = 3');
    expect(auditRunner).toContain('process.exitCode = 1');
  });

  it('keeps recovered exports, evidence, and credentials outside Vercel uploads', () => {
    const ignored = readFileSync('.vercelignore', 'utf8');

    for (const path of [
      '.github/',
      '.env.*',
      '.git/',
      '.vercel/',
      'chat-images/',
      'node_modules/',
      'test_reports/',
      'tmp/',
      'tmp_make_chat_pdf.py',
    ]) {
      expect(ignored).toContain(path);
    }
  });
});
