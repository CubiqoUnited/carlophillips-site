import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('Production commerce lint', () => {
  it('passes the canonical release workflow and keeps the fail-closed fallback distinct', () => {
    const result = spawnSync(process.execPath, ['scripts/lint-production-commerce.mjs'], { encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('Production-commerce lint passed');
    const workflow = readFileSync('.github/workflows/vercel-release-candidate.yml', 'utf8');
    expect(workflow).toContain('default: true');
    expect(workflow).toContain('--meta cpArtifactKind=safe-fallback');
  });
});
