import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const registry = JSON.parse(fs.readFileSync('config/production-authorities.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8');

describe('production authority system', () => {
  it('defines each of the 12 non-overlapping authority areas with a complete operating contract', () => {
    expect(registry.schemaVersion).toBe('cp.production-authorities.v1');
    expect(registry.authorities).toHaveLength(12);
    expect(new Set(registry.authorities.map(({ id }) => id)).size).toBe(12);
    for (const authority of registry.authorities) {
      expect(authority.source).toBeTruthy();
      expect(authority.owner).toBeTruthy();
      expect(authority.accountable).toBe('Product Owner');
      expect(authority.consumers.length).toBeGreaterThan(0);
      expect(authority.validation.length).toBeGreaterThan(0);
      expect(authority.productionGate).toBeTruthy();
      expect(authority.failureMode).toBeTruthy();
      expect(authority.rollback).toBeTruthy();
    }
  });

  it('keeps one-main production intent and PR Preview staging explicit', () => {
    expect(registry.releaseModel).toMatchObject({
      productionBranch: 'main',
      stagingSurface: 'vercel-preview',
      featureDelivery: 'temporary-branch-pull-request',
      promotionRequiresProductOwnerApproval: true,
    });
  });

  it('binds deployment tooling to the read-only verified production project', () => {
    expect(registry.vercel.expectedProjectName).toBe('carlophillips-site');
    expect(registry.vercel.identityStatus).toBe('verified-read-only-2026-08-14');
    expect(registry.vercel.projectId).toBe('prj_9VHD0AhhQnuml8frfNDsmFLHXcq1');
    expect(registry.vercel.orgId).toBe('team_8ABMxicIAtMyzgNYsJawFad0');
  });

  it('runs all repository quality gates for pull requests and main pushes', () => {
    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('branches:\n      - main');
    expect(workflow).toContain('node-version: 24');
    for (const command of ['yarn install --frozen-lockfile', 'yarn verify', 'yarn test:a11y']) {
      expect(workflow).toContain(command);
    }
    expect(workflow).toContain('mkdir -p test_reports/ci');
    expect(workflow).toContain('name: Verify');
  });
});
