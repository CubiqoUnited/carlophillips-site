import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StorefrontHeader } from '../apps/web/src/components/layout/StorefrontHeader/index.tsx';

describe('StorefrontHeader accessibility', () => {
  it('keeps the current bag count available as a desktop navigation link', () => {
    const html = renderToStaticMarkup(
      <StorefrontHeader pageLabel="Bag" bagCount={1} />
    );

    expect(html).toMatch(
      /<a (?=[^>]*href="\/bag")(?=[^>]*aria-current="page")[^>]*>Bag 1<\/a>/
    );
  });
});
