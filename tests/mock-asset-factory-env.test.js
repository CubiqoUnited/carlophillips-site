import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { loadAssetFactoryEnvironment } from '../tools/mock-asset-factory-env.mjs';

const TEST_KEY = 'MOCK_ASSET_FACTORY_ENV_TEST_ONLY';

afterEach(() => {
  delete process.env[TEST_KEY];
});

describe('asset factory environment loader', () => {
  it('loads a selected private environment file without requiring exports', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'mock-assets-env-'));
    const path = join(directory, 'providers.env');
    await writeFile(path, `${TEST_KEY}=loaded\n`, 'utf8');

    expect(loadAssetFactoryEnvironment(path)).toEqual({ loaded: true, path });
    expect(process.env[TEST_KEY]).toBe('loaded');
  });

  it('reports a missing environment file without failing startup', () => {
    const path = join(tmpdir(), 'missing-mock-assets-provider-file');
    expect(loadAssetFactoryEnvironment(path)).toEqual({ loaded: false, path });
  });
});
