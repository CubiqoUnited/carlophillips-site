import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildMediaViewerProjection } from '../apps/web/src/lib/media/viewer';

function approvedMedia(index: number) {
  return {
    id: `media-${index}`,
    registryAssetId: `registry-${index}`,
    approvalStatus: 'approved' as const,
    sourceAuthority: 'product-release-media-registry' as const,
    type: 'image' as const,
    url: `https://cdn.example/approved-${index}.jpg`,
    previewUrl: `https://cdn.example/approved-${index}.jpg`,
    alt: `Approved view ${index}`,
    label: `Approved view ${index}`,
    modalities: ['front'] as const,
  };
}

describe('controlled product media display', () => {
  it('caps the policy-authorized viewer projection at twenty-four views', () => {
    const projection = buildMediaViewerProjection({
      media: Array.from({ length: 25 }, (_, index) => approvedMedia(index)),
    });

    expect(projection).toHaveLength(24);
    expect(projection.map((item) => item.registryAssetId)).toEqual(
      Array.from({ length: 24 }, (_, index) => `registry-${index}`)
    );
  });

  it('renders sanitized Shopify staging media without accepting arbitrary authorities', () => {
    const projection = buildMediaViewerProjection({
      media: [
        {
          id: 'sha256:shopify-front',
          approvalStatus: 'staging-review' as never,
          sourceAuthority: 'shopify-canonical-staging' as never,
          type: 'image',
          url: 'https://cdn.shopify.com/s/files/1/front.jpg',
          previewUrl: 'https://cdn.shopify.com/s/files/1/front.jpg',
          alt: 'Shopify front',
          label: 'Shopify staging media',
          modalities: [],
        },
      ],
    });

    expect(projection).toHaveLength(1);
    expect(projection[0]).toMatchObject({
      src: 'https://cdn.shopify.com/s/files/1/front.jpg',
      disclosure: 'Shopify staging product view',
      sourceAuthority: 'shopify-canonical-staging',
    });
  });

  it('rejects media without approval authority before the viewer', () => {
    const projection = buildMediaViewerProjection({
      media: [
        approvedMedia(0),
        {
          ...approvedMedia(1),
          approvalStatus: 'pending' as never,
        },
        {
          ...approvedMedia(2),
          sourceAuthority: 'shopify-widget' as never,
        },
      ],
    });

    expect(projection).toHaveLength(1);
    expect(projection[0]?.registryAssetId).toBe('registry-0');
  });

  it('does not serve candidate media or embed Shopify generation widgets', () => {
    expect(
      existsSync(
        'apps/web/public/products/signature-hoodie/candidates/modelize/editorial-02.jpg'
      )
    ).toBe(false);

    const activeSource = [
      'apps/web/src/components/product/MediaViewer/index.tsx',
      'apps/web/src/components/product/Sequence/index.tsx',
      'apps/web/src/components/editorial/HomeStorefront/index.tsx',
    ]
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');

    expect(activeSource).not.toMatch(
      /Spin Studio|Instant 3D|theme app block|shopify-widget/i
    );
    expect(activeSource).not.toMatch(/\/candidates\//);
  });
});
