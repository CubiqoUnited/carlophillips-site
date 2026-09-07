import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Phase 1 synthetic exception workflow', () => {
  const workflow = readFileSync(
    '.github/workflows/phase1-exception-drills.yml',
    'utf8'
  );

  it('binds evidence to an exact candidate and labels it synthetic only', () => {
    expect(workflow).toContain('expected_sha:');
    expect(workflow).toContain(
      'test "$(git rev-parse HEAD)" = "$EXPECTED_SHA"'
    );
    expect(workflow).toContain("evidenceClassification: 'synthetic_only'");
    expect(workflow).toContain('liveOperationalProof: false');
  });

  it('cannot claim or perform a real commercial lifecycle', () => {
    expect(workflow).toContain('externalSystemsMutated: false');
    expect(workflow).toContain('paymentAttempted: false');
    expect(workflow).toContain('orderSubmitted: false');
    expect(workflow).toContain('fulfillmentRequested: false');
    expect(workflow).not.toContain('SHOPIFY_STOREFRONT_TOKEN');
    expect(workflow).not.toContain('SHOPIFY_WEBHOOK_SECRET');
    expect(workflow).not.toContain('environment: Production');
  });

  it('covers the defined support, webhook, lifecycle and customer-routing drills', () => {
    for (const testFile of [
      'tests/apps-web-contact-route.test.js',
      'tests/shopify-webhook-route-failure.test.js',
      'tests/order-lifecycle.test.js',
      'tests/post-purchase-policy.test.js',
      'tests/controlled-commerce-runbook.test.js',
    ]) {
      expect(workflow).toContain(testFile);
    }
  });
});
