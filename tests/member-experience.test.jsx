import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MemberExperience } from '../apps/web/src/components/member/MemberExperience.tsx';
import { resolvePostPurchaseCapabilities } from '../apps/web/src/lib/commerce/post-purchase-policy.ts';

describe('CP Aftercare experience', () => {
  it('presents customer-facing aftercare without internal or simulated facts', () => {
    const html = renderToStaticMarkup(
      <MemberExperience capabilities={resolvePostPurchaseCapabilities({})} />
    );

    expect(html).toContain('From confirmation to what comes next.');
    expect(html).toContain('Access your order securely.');
    expect(html).toContain('For privacy');
    expect(html).toContain('Self-service returns are not configured');
    expect(html).not.toContain('CP Credit');
    expect(html).not.toContain('€15.00');
    expect(html).not.toContain('PRIVATE PREVIEW');
    expect(html).not.toContain('Shopify authoritative');
    expect(html).not.toContain('Fit memory');
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
