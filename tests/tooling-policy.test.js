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

  it('retries transient dependency-audit failures without weakening the gate', () => {
    const auditRunner = readFileSync(
      'scripts/run-yarn-audit-with-retry.mjs',
      'utf8'
    );

    expect(packageDocument.scripts['audit:prod']).toBe(
      'node scripts/run-yarn-audit-with-retry.mjs'
    );
    expect(auditRunner).toContain("'audit'");
    expect(auditRunner).toContain("'dependencies'");
    expect(auditRunner).toContain("'moderate'");
    expect(auditRunner).toContain("'--network-timeout'");
    expect(auditRunner).toContain('const attempts = 3');
    expect(auditRunner).toContain('process.exitCode = lastStatus');
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
