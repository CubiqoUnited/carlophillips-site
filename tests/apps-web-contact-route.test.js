import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { POST } from '../apps/web/src/app/api/contact/route.ts';

const originalEnvironment = { ...process.env };

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CP_SUPPORT_FROM_EMAIL;
  delete process.env.CP_SUPPORT_TO_EMAIL;
});

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.unstubAllGlobals();
});

function request(body, origin = 'https://www.carlophillips.com') {
  return new Request('https://www.carlophillips.com/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin },
    body: JSON.stringify(body),
  });
}

const valid = {
  email: 'customer@example.com',
  topic: 'order-status',
  orderNumber: 'CP-1001',
  message: 'Please help me understand the current order status.',
};

describe('deployed apps/web contact boundary', () => {
  it('never reports delivery before a real destination is configured', async () => {
    const response = await POST(request(valid));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'SUPPORT_DESTINATION_NOT_CONFIGURED',
    });
  });

  it('rejects invalid fields and cross-origin submissions', async () => {
    const invalid = await POST(request({ ...valid, message: 'short' }));
    expect(invalid.status).toBe(400);
    expect((await invalid.json()).fields).toContain('message');

    const crossOrigin = await POST(request(valid, 'https://attacker.example'));
    expect(crossOrigin.status).toBe(403);
    expect(await crossOrigin.json()).toEqual({ error: 'ORIGIN_REJECTED' });
  });

  it('reports success only after the configured provider accepts delivery', async () => {
    process.env.RESEND_API_KEY = 'configured-test-key';
    process.env.CP_SUPPORT_FROM_EMAIL = 'support@carlophillips.example';
    process.env.CP_SUPPORT_TO_EMAIL = 'operator@carlophillips.example';
    const provider = vi.fn(
      async () =>
        new Response(JSON.stringify({ id: 'provider-message-id' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
    );
    vi.stubGlobal('fetch', provider);

    const response = await POST(request(valid));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result).toMatchObject({ ok: true });
    expect(result.requestId).toMatch(/^CP-[A-F0-9]{8}$/);
    expect(provider).toHaveBeenCalledOnce();

    const [url, init] = provider.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.authorization).toBe('Bearer configured-test-key');
    const payload = JSON.parse(init.body);
    expect(payload).toMatchObject({
      from: 'CARLOPHILLIPS <support@carlophillips.example>',
      to: ['operator@carlophillips.example'],
      reply_to: valid.email,
      subject: 'CARLOPHILLIPS support — Order status',
    });
    expect(payload.text).toContain(valid.message);
    expect(JSON.stringify(result)).not.toContain('provider-message-id');
  });

  it('does not report delivery when the provider rejects or cannot receive it', async () => {
    process.env.RESEND_API_KEY = 'configured-test-key';
    process.env.CP_SUPPORT_FROM_EMAIL = 'support@carlophillips.example';
    process.env.CP_SUPPORT_TO_EMAIL = 'operator@carlophillips.example';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 429 }))
    );

    const response = await POST(request(valid));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'SUPPORT_DELIVERY_FAILED' });
  });
});
