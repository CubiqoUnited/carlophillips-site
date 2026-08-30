import { describe, expect, it } from 'vitest';
import shippingConfig from '../config/storefront-shipping.json';

describe('checkout country configuration', () => {
  it('offers the United States as a served checkout destination', () => {
    expect(shippingConfig.servedCountries).toContainEqual({
      code: 'US',
      label: 'United States',
    });
    expect(shippingConfig.unservedCountries).not.toContainEqual(
      expect.objectContaining({ code: 'US' })
    );
  });
});
