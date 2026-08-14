import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildHomeGalleryMedia } from '../components/storefront/home-storefront.jsx';
import { SIGNATURE_HOODIE_SHOWCASE_MEDIA } from '../lib/media/signature-hoodie-showcase.js';

const selectedModaFiles = [
  'model-front-full.jpg',
  'model-three-quarter.jpg',
  'model-seated.jpg',
  'model-side-profile.jpg',
  'model-back-digital-study.jpg',
  'product-flat-lay.jpg',
];

function previewSummary() {
  return {
    environment: 'preview',
    visibleCount: 1,
    primaryProduct: {
      href: '/products/carlophillips-signature-hoodie',
      media: [
        {
          type: 'image',
          url: '/products/signature-hoodie/candidates/modelize/editorial-01.jpg',
          previewUrl: '/products/signature-hoodie/candidates/modelize/editorial-01.jpg',
          alt: 'Modelize editorial candidate',
          label: 'Product still',
        },
        {
          type: 'image',
          url: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
          previewUrl: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
          alt: 'Modelize front candidate',
          label: 'Product still',
        },
      ],
    },
  };
}

describe('Signature Hoodie homepage media coverage', () => {
  it('includes the selected Modelize, MODA, detail, and still-derived motion assets', () => {
    const gallery = buildHomeGalleryMedia(previewSummary());
    const sources = gallery.map(item => item.src);

    expect(sources).toEqual(expect.arrayContaining([
      '/products/signature-hoodie/candidates/modelize/editorial-01.jpg',
      '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
      ...selectedModaFiles.map(file => `/products/signature-hoodie/candidates/moda/${file}`),
      '/products/signature-hoodie/candidates/ai-assisted/material-embroidery-study.png',
      '/products/signature-hoodie/candidates/ai-assisted/still-derived-motion-study.webp',
    ]));
    expect(gallery.find(item => item.gifHref)).toMatchObject({
      label: 'Still-derived motion loop',
      gifHref: '/products/signature-hoodie/candidates/ai-assisted/still-derived-motion-study.gif',
    });
    for (const item of gallery) {
      expect(existsSync(`public${item.src}`), item.src).toBe(true);
    }
    expect(existsSync(`public${gallery.find(item => item.gifHref).gifHref}`)).toBe(true);
  });

  it('excludes the quarantined back hypothesis and superseded built-in front study', () => {
    const sources = buildHomeGalleryMedia(previewSummary()).map(item => item.src);
    expect(sources).not.toContain('/products/signature-hoodie/candidates/ai-assisted/back-flatlay-hypothesis.png');
    expect(sources).not.toContain('/products/signature-hoodie/candidates/ai-assisted/on-model-front-study.png');
  });

  it('does not label still-derived animation as genuine video, 360, or 3D', () => {
    const serialized = JSON.stringify(SIGNATURE_HOODIE_SHOWCASE_MEDIA).toLowerCase();
    expect(serialized).toContain('still-derived motion');
    expect(serialized).not.toContain('360');
    expect(serialized).not.toContain('3d');
    expect(SIGNATURE_HOODIE_SHOWCASE_MEDIA.some(item => item.type === 'video')).toBe(false);
  });
});
