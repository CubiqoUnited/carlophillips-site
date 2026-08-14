import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import packageDocument from '../package.json';
import campaignRegistry from '../config/campaign-media-registry.json';
import productMediaRegistry from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import { PODPIPE_SECTION_IDS } from '../apps/web/src/lib/media/types.ts';

function filesBelow(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });
}

describe('final architecture acceptance', () => {
  it('uses Yarn Classic workspaces without introducing pnpm or npm state', () => {
    expect(packageDocument.packageManager).toMatch(/^yarn@1\.22\.22/);
    expect(packageDocument.workspaces).toEqual(['apps/*', 'packages/*']);
    for (const path of [
      'apps/web/package.json',
      'packages/design-system/package.json',
      'packages/shopify/package.json',
      'packages/config/package.json',
      'packages/utils/package.json',
      'turbo.json',
    ]) {
      expect(existsSync(path), `${path} must exist`).toBe(true);
    }
    expect(existsSync('pnpm-workspace.yaml')).toBe(false);
    expect(existsSync('pnpm-lock.yaml')).toBe(false);
    expect(existsSync('package-lock.json')).toBe(false);
  });

  it('runs the storefront from apps/web with the mandated route boundaries', () => {
    for (const path of [
      'apps/web/src/app/layout.tsx',
      'apps/web/src/app/(editorial)/page.tsx',
      'apps/web/src/app/product/[handle]/page.tsx',
      'apps/web/src/app/collection/[handle]/page.tsx',
      'apps/web/src/components/product/ProductInfo/index.tsx',
      'apps/web/src/components/product/ProductForm/index.tsx',
      'apps/web/src/components/product/Sequence/index.tsx',
      'apps/web/src/lib/media/approval.ts',
      'apps/web/src/lib/media/mapping.ts',
      'apps/web/src/lib/media/sequences/podpipe.ts',
      'apps/web/src/lib/media/viewer.ts',
      'apps/web/src/hooks/index.ts',
      'apps/web/src/stores/index.ts',
      'apps/web/src/types/index.ts',
      'apps/web/src/styles/README.md',
    ]) {
      expect(existsSync(path), `${path} must exist`).toBe(true);
    }
    expect(existsSync('app')).toBe(false);
  });

  it('keeps the exact eleven-section PODPIPE display contract', () => {
    expect(PODPIPE_SECTION_IDS).toEqual([
      'campaign-opening',
      'product-alone',
      'on-body-editorial',
      'embroidery-detail',
      'material-construction-story',
      'product-motion',
      'spin-360',
      'model-3d',
      'construction-details',
      'shopify-facts',
      'fulfillment-care-returns',
    ]);
  });

  it('publishes only registry-approved files below apps/web/public/media', () => {
    const publicFiles = filesBelow('apps/web/public/media').sort();
    const approvedCampaignFiles = campaignRegistry.assets
      .filter((asset) => asset.approvalStatus === 'approved')
      .map((asset) => `apps/web/public${asset.publicPath}`);
    const approvedProductFiles = productMediaRegistry.assets
      .filter(
        (asset) =>
          asset.approvalStatus === 'approved' &&
          asset.source.reference.startsWith('apps/web/public/media/')
      )
      .map((asset) => asset.source.reference);
    const approvedFiles = [
      ...approvedCampaignFiles,
      ...approvedProductFiles,
    ].sort();

    expect(publicFiles).toEqual(approvedFiles);
    expect(publicFiles).not.toEqual([]);
    expect(publicFiles.join('\n')).not.toMatch(
      /candidate|draft|quarantin|unverified/i
    );
  });

  it('keeps candidate media outside active customer surfaces', () => {
    const active = [
      readFileSync(
        'apps/web/src/components/editorial/HomeStorefront/index.tsx',
        'utf8'
      ),
      readFileSync(
        'apps/web/src/components/product/ProductInfo/index.tsx',
        'utf8'
      ),
      readFileSync('apps/web/src/app/product/[handle]/page.tsx', 'utf8'),
    ].join('\n');
    expect(active).not.toMatch(
      /signature-hoodie-showcase|\/candidates\/(?:moda|ai-assisted)|public\/products\//
    );
  });

  it('keeps mandatory quality controls wired to pull requests and commits', () => {
    const tsconfig = JSON.parse(
      readFileSync('packages/config/typescript.json', 'utf8')
    );
    const workflow = readFileSync('.github/workflows/quality.yml', 'utf8');
    const preCommit = readFileSync('.husky/pre-commit', 'utf8');
    const commitMessage = readFileSync('.husky/commit-msg', 'utf8');

    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(packageDocument.scripts).toMatchObject({
      typecheck: 'tsc --noEmit',
      stylelint: expect.any(String),
      'format:check': expect.any(String),
    });
    expect(workflow).toContain('yarn install --frozen-lockfile');
    expect(workflow).toContain('yarn typecheck');
    expect(workflow).toContain('yarn stylelint');
    expect(preCommit).toContain('node_modules/.bin/lint-staged');
    expect(commitMessage).toContain('node_modules/.bin/commitlint');
  });
});
