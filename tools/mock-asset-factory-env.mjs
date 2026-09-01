import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

export const DEFAULT_ASSET_FACTORY_ENV = resolve('.env.mock-assets.local');

export function loadAssetFactoryEnvironment(path = DEFAULT_ASSET_FACTORY_ENV) {
  const resolvedPath = resolve(path);
  if (!existsSync(resolvedPath)) {
    return { loaded: false, path: resolvedPath };
  }
  loadEnvFile(resolvedPath);
  return { loaded: true, path: resolvedPath };
}
