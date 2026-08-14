import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildHomeGalleryMedia } from '../apps/web/src/components/editorial/HomeStorefront/index.tsx';

function eligibleSummary() {
  return {
    environment: 'preview',
    visibleCount: 1,
    primaryProduct: {
      title: 'Signature Hoodie',
      href: '/product/carlophillips-signature-hoodie',
      media: [
        {
          id: 'front-approved',
          registryAssetId: 'front-approved',
          approvalStatus: 'approved',
          sourceAuthority: 'product-release-media-registry',
          type: 'image',
          url: 'https://cdn.example/front-approved.jpg',
          previewUrl: 'https://cdn.example/front-approved.jpg',
          alt: 'Approved front view',
          label: 'front',
          modalities: ['front'],
        },
        {
          id: 'film-approved',
          registryAssetId: 'film-approved',
          approvalStatus: 'approved',
          sourceAuthority: 'product-release-media-registry',
          type: 'video',
          url: 'https://cdn.example/film-approved.mp4',
          previewUrl: 'https://cdn.example/film-poster-approved.jpg',
          alt: 'Approved product film',
          label: 'video',
          modalities: ['video'],
          motionRole: 'film',
        },
      ],
    },
  };
}

describe('Signature Hoodie homepage media boundary', () => {
  it('renders only the media already carried by the eligible server summary', () => {
    const gallery = buildHomeGalleryMedia(eligibleSummary());
    expect(gallery).toHaveLength(2);
    expect(gallery.map((item) => item.src)).toEqual([
      'https://cdn.example/front-approved.jpg',
      'https://cdn.example/film-approved.mp4',
    ]);
    expect(
      gallery.every((item) => item.disclosure === 'Release-bound product view')
    ).toBe(true);
  });

  it('never imports quarantined candidate studies into active customer components', () => {
    const customerSource = [
      readFileSync(
        'apps/web/src/components/editorial/HomeStorefront/index.tsx',
        'utf8'
      ),
      readFileSync(
        'apps/web/src/components/product/ProductInfo/index.tsx',
        'utf8'
      ),
    ].join('\n');

    expect(customerSource).not.toContain('signature-hoodie-showcase');
    expect(customerSource).not.toContain('/candidates/moda/');
    expect(customerSource).not.toContain('/candidates/ai-assisted/');
    expect(customerSource).not.toContain('still-derived-motion-study');
  });

  it('emits no product media for a denied or different product', () => {
    expect(
      buildHomeGalleryMedia({ ...eligibleSummary(), visibleCount: 0 })
    ).toEqual([]);
    expect(
      buildHomeGalleryMedia({
        ...eligibleSummary(),
        primaryProduct: {
          ...eligibleSummary().primaryProduct,
          href: '/product/other',
        },
      })
    ).toEqual([]);
  });
});
