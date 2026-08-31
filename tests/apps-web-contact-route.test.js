import { describe, expect, it } from 'vitest';
import { POST } from '../apps/web/src/app/api/contact/route.ts';

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
});
