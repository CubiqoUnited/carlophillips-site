import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { DurableWebhookStore } from '../apps/web/src/lib/commerce/webhook-idempotency';

describe('durable Shopify webhook idempotency', () => {
  it('fails closed without a durable HTTPS store', () => {
    expect(() => new DurableWebhookStore('', 'token', 'preview')).toThrowError(
      'DURABLE_WEBHOOK_STORE_NOT_CONFIGURED'
    );
    expect(
      () => new DurableWebhookStore('https://redis.example', '', 'preview')
    ).toThrowError('DURABLE_WEBHOOK_STORE_NOT_CONFIGURED');
  });

  it('uses an atomic expiring claim, sanitized record, and release operation', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: 'OK' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: 'OK' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: 1 })));
    const store = new DurableWebhookStore(
      'https://redis.example',
      'secret-token',
      'preview',
      fetchImpl
    );

    await expect(
      store.claim('webhook-1', new Date(Date.now() + 60_000))
    ).resolves.toBe(true);
    await expect(
      store.record('webhook-1', { topic: 'orders/paid', payloadHash: 'hash' })
    ).resolves.toBeUndefined();
    await expect(store.release('webhook-1')).resolves.toBeUndefined();

    const claim = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(claim.slice(0, 5)).toEqual([
      'SET',
      'cp:preview:shopify:webhook:webhook-1',
      'claimed',
      'NX',
      'PX',
    ]);
    expect(claim[5]).toBeGreaterThan(0);
    const record = JSON.parse(fetchImpl.mock.calls[1][1].body);
    expect(record[0]).toBe('SET');
    expect(record[1]).toBe('cp:preview:shopify:webhook-event:webhook-1');
    expect(record[3]).toBe('EX');
    expect(record[4]).toBe(60 * 60 * 24 * 30);
    expect(JSON.parse(record[2])).toEqual({
      topic: 'orders/paid',
      payloadHash: 'hash',
    });
    expect(JSON.parse(fetchImpl.mock.calls[2][1].body)).toEqual([
      'DEL',
      'cp:preview:shopify:webhook:webhook-1',
    ]);
  });

  it('does not treat a previously claimed delivery as new', async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ result: null }))
    );
    const store = new DurableWebhookStore(
      'https://redis.example',
      'token',
      'production',
      fetchImpl
    );
    await expect(
      store.claim('webhook-1', new Date(Date.now() + 60_000))
    ).resolves.toBe(false);
  });

  it('allows only one of two runtime instances to claim a delivery', async () => {
    let claimed = false;
    const fetchImpl = vi.fn(async (_url, init) => {
      const command = JSON.parse(init.body);
      if (command[0] !== 'SET' || !command.includes('NX')) {
        return new Response(JSON.stringify({ result: 'OK' }));
      }
      if (claimed) return new Response(JSON.stringify({ result: null }));
      claimed = true;
      return new Response(JSON.stringify({ result: 'OK' }));
    });
    const first = new DurableWebhookStore(
      'https://redis.example',
      'token',
      'preview',
      fetchImpl
    );
    const second = new DurableWebhookStore(
      'https://redis.example',
      'token',
      'preview',
      fetchImpl
    );
    const results = await Promise.all([
      first.claim('shared-id', new Date(Date.now() + 60_000)),
      second.claim('shared-id', new Date(Date.now() + 60_000)),
    ]);
    expect(results.sort()).toEqual([false, true]);
  });
});
