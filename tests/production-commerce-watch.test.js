import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Production commerce watch', () => {
  const workflow = readFileSync(
    '.github/workflows/production-commerce-watch.yml',
    'utf8'
  );
  const verifier = readFileSync('scripts/verify-checkout-health.mjs', 'utf8');

  it('runs automatically and permits incident issue routing', () => {
    expect(workflow).toContain('schedule:');
    expect(workflow).toContain("cron: '7,37 * * * *'");
    expect(workflow).toContain('issues: write');
    expect(workflow).toContain("'[P0] Production commerce watch failed'");
  });

  it('creates a real cart and verifies a trusted checkout handoff without payment', () => {
    expect(workflow).toContain('--cart-probe true');
    expect(verifier).toContain("cartAction: 'add'");
    expect(verifier).toContain("cartAction: 'checkout'");
    expect(verifier).toContain('checkoutResponse.status !== 303');
    expect(verifier).toContain("endsWith('.myshopify.com')");
    expect(verifier).toContain('privateCheckoutUrlRetained: false');
    expect(verifier).toContain('paymentAttempted: false');
    expect(verifier).toContain('orderSubmitted: false');
    expect(workflow).not.toContain('checkoutLocation');
  });
});
