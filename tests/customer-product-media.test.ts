import { describe, expect, it } from 'vitest';
import { curateCustomerMedia } from '../apps/web/src/lib/media/customer-product-media';

describe('customer product media curation', () => {
  it('removes the supplier-first canvas and preserves the editorial order', () => {
    const media = Array.from({ length: 12 }, (_, index) => `image-${index}`);

    expect(curateCustomerMedia(media)).toEqual([
      'image-1',
      'image-4',
      'image-5',
      'image-6',
      'image-7',
      'image-8',
      'image-9',
      'image-10',
    ]);
    expect(curateCustomerMedia(media)).not.toContain('image-0');
    expect(curateCustomerMedia(media)).not.toContain('image-11');
  });

  it('keeps a truthful fallback when only one image is available', () => {
    expect(curateCustomerMedia(['only-image'])).toEqual(['only-image']);
  });
});
