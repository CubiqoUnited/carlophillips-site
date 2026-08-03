import { existsSync } from 'node:fs';
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
});
