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
  it('caps the release-bound viewer projection at twelve approved views', () => {
    const projection = buildMediaViewerProjection({
      media: Array.from({ length: 13 }, (_, index) => approvedMedia(index)),
    });

    expect(projection).toHaveLength(12);
    expect(projection.map((item) => item.registryAssetId)).toEqual(
      Array.from({ length: 12 }, (_, index) => `registry-${index}`)
    );
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
