import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import packageDocument from '../package.json';

const webPackageDocument = JSON.parse(
  readFileSync('apps/web/package.json', 'utf8')
);

describe('tooling and supported-runtime policy', () => {
  it('pins the verified supported framework and React runtime', () => {
    expect(webPackageDocument.dependencies.next).toBe('15.5.21');
    expect(webPackageDocument.dependencies.react).toBe('19.2.8');
    expect(webPackageDocument.dependencies['react-dom']).toBe('19.2.8');
  });

  it('keeps the repository Yarn-only', () => {
    expect(packageDocument.packageManager).toMatch(/^yarn@1\.22\.22/);
    expect(existsSync('package-lock.json')).toBe(false);
    expect(existsSync('pnpm-lock.yaml')).toBe(false);
  });

  it('records temporary patched transitive security resolutions', () => {
    expect(packageDocument.resolutions).toMatchObject({
      lodash: '4.18.1',
      nanoid: '3.3.18',
      postcss: '8.5.25',
      sharp: '0.35.3',
    });
    expect(webPackageDocument.dependencies.axios).toBeUndefined();
    expect(webPackageDocument.dependencies.uuid).toBeUndefined();
  });

  it('keeps recovered exports, evidence, and credentials outside Vercel uploads', () => {
    const ignored = readFileSync('.vercelignore', 'utf8');

    for (const path of [
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
