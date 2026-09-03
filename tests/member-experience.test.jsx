import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MemberExperience } from '../apps/web/src/components/member/MemberExperience.tsx';
import { resolvePostPurchaseCapabilities } from '../apps/web/src/lib/commerce/post-purchase-policy.ts';

describe('CP Aftercare experience', () => {
  it('presents the full journey without inventing Shopify facts', () => {
    const html = renderToStaticMarkup(
      <MemberExperience capabilities={resolvePostPurchaseCapabilities({})} />
    );

    expect(html).toContain('From confirmation to what comes next.');
    expect(html).toContain('Confirmed');
    expect(html).toContain('In production');
    expect(html).toContain('Dispatched');
    expect(html).toContain('Delivered');
    expect(html).toContain('Return or refund');
    expect(html).toContain('Fit memory');
    expect(html).toContain('Shopify authoritative');
    expect(html).toContain('Self-service returns are not configured');
    expect(html).not.toContain('CP Credit');
    expect(html).not.toContain('€15.00');
    expect(html).not.toContain('PRIVATE PREVIEW');
  });

  it('shows CP Credit only when authenticated Shopify truth enables it', () => {
    const capabilities = resolvePostPurchaseCapabilities({}, 'production', {
      authenticated: true,
      reviewEligibility: 'unknown',
      creditAccountAvailable: true,
      creditUrl: 'https://shop.example.com/account/credit',
    });
    const html = renderToStaticMarkup(
      <MemberExperience capabilities={capabilities} />
    );
    expect(html).toContain('CP Credit');
    expect(html).toContain('View CP Credit');
  });
});
