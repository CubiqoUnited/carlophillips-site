import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('controlled commerce lifecycle runbook', () => {
  const runbook = readFileSync(
    'docs/runbooks/controlled-commerce-lifecycle.md',
    'utf8'
  );

  it('does not treat the expired checkout-preparation record as real-order authority', () => {
    expect(runbook).toContain('expired on 2026-08-24');
    expect(runbook).toContain('cannot authorize the real order');
    expect(runbook).toContain('authorized human');
    expect(runbook).toContain('submits exactly one order');
  });

  it('requires the complete native Shopify-to-Apliiq evidence chain', () => {
    for (const evidence of [
      'exactly-one Shopify order evidence',
      'exactly-one Apliiq acceptance evidence',
      'Shopify fulfillment and tracking presence',
      'customer status/notification observation',
      'reconciliation result and every variance',
    ]) {
      expect(runbook).toContain(evidence);
    }
  });

  it('keeps synthetic exception evidence distinct from live proof', () => {
    expect(runbook).toContain('clearly label synthetic evidence');
    expect(runbook).toContain('Live proof still required?');
    expect(runbook).toContain('This runbook does not authorize a purchase');
  });

  it('forbids sensitive evidence retention', () => {
    expect(runbook).toContain('No screenshot or artifact may contain');
    expect(runbook).toContain('payment data');
    expect(runbook).toContain('private URLs');
    expect(runbook).toContain('tokens or secrets');
  });
});
