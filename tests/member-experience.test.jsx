import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MemberExperience } from '../apps/web/src/components/member/MemberExperience.tsx';

describe('CP Member experience', () => {
  it('presents the private customer layer without claiming live account authority', () => {
    const html = renderToStaticMarkup(<MemberExperience />);

    expect(html).toContain('A private layer around the brand.');
    expect(html).toContain('Private access');
    expect(html).toContain('Saved pieces');
    expect(html).toContain('CP Credit');
    expect(html).toContain('Fit memory');
    expect(html).toContain('Preview surface');
    expect(html).toContain('does not create a live Shopify customer account');
    expect(html).toContain(
      'Service/account communication and marketing consent'
    );
    expect(html).toContain('PRIVATE PREVIEW');
    expect(html).not.toContain('10% off');
  });
});
