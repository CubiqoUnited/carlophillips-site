import { describe, expect, it } from 'vitest';
import { PODPIPE_SECTION_IDS } from '../apps/web/src/lib/media/types.ts';
import {
  projectPodpipeSequence,
  validatePodpipeSequence,
} from '../apps/web/src/lib/media/sequences/podpipe.ts';

const expectedOrder = [
  'campaign-opening',
  'product-alone',
  'on-body-editorial',
  'embroidery-detail',
  'material-construction-story',
  'product-motion',
  'spin-360',
  'model-3d',
  'construction-details',
  'shopify-facts',
  'fulfillment-care-returns',
];

const releaseBinding = {
  releaseId: 'cp-signature-hoodie-2026-001',
  handle: 'carlophillips-signature-hoodie',
  variantFingerprint: `sha256:${'a'.repeat(64)}`,
  commerceFactsFingerprint: `sha256:${'b'.repeat(64)}`,
  observationFingerprint: `sha256:${'c'.repeat(64)}`,
};

const commerce = {
  approvalStatus: 'reviewed',
  sourceAuthority: 'reviewed-shopify-observation',
  binding: releaseBinding,
  data: {
    title: 'Signature Hoodie',
    price: 128,
    currency: 'USD',
    availableForSale: false,
    sizes: ['XS', 'S'],
    sizeGuide: null,
    bagAllowed: false,
    checkoutAllowed: false,
  },
};

function approvedMedia(overrides) {
  return {
    id: 'approved-front',
    registryAssetId: 'registry-front',
    approvalStatus: 'approved',
    sourceAuthority: 'product-release-media-registry',
    type: 'image',
    url: '/media/products/front.png',
    previewUrl: '/media/products/front.png',
    alt: 'Approved front view',
    label: 'Front view',
    modalities: ['front'],
    ...overrides,
  };
}

describe('official PODPIPE product display sequence', () => {
  it('keeps the exact eleven-section order stable', () => {
    expect(PODPIPE_SECTION_IDS).toEqual(expectedOrder);
    const sequence = projectPodpipeSequence({});
    expect(sequence.map((section) => section.id)).toEqual(expectedOrder);
    expect(sequence.map((section) => section.position)).toEqual(
      Array.from({ length: 11 }, (_, index) => index + 1)
    );
    expect(validatePodpipeSequence(sequence).ready).toBe(false);
  });

  it('maps only approved registry media and withholds incomplete sections', () => {
    const sequence = projectPodpipeSequence({
      campaign: {
        assetId: 'campaign-approved',
        src: '/media/editorial/runway.png',
        alt: 'Approved runway campaign',
        approvalStatus: 'approved',
        sourceAuthority: 'approved-campaign-registry',
      },
      media: [
        approvedMedia({}),
        approvedMedia({
          id: 'unapproved-back',
          registryAssetId: 'registry-back',
          approvalStatus: 'pending',
          modalities: ['back-angle'],
        }),
        approvedMedia({
          id: 'film',
          registryAssetId: 'registry-film',
          type: 'video',
          url: '/media/products/film.mp4',
          previewUrl: '/media/products/film.jpg',
          modalities: ['video'],
          motionRole: 'film',
        }),
      ],
      releaseBinding,
      commerce,
      model3dApplicable: true,
    });
    const byId = Object.fromEntries(
      sequence.map((section) => [section.id, section])
    );

    expect(byId['campaign-opening'].status).toBe('available');
    expect(byId['product-alone']).toMatchObject({
      status: 'withheld',
      blockers: ['CLEAN_FRONT_AND_BACK_REQUIRED'],
    });
    expect(byId['product-alone'].assets).toHaveLength(1);
    expect(byId['product-motion']).toMatchObject({
      status: 'withheld',
      blockers: ['APPROVED_FILM_AND_LIGHTWEIGHT_PREVIEW_REQUIRED'],
    });
    expect(byId['shopify-facts'].status).toBe('available');
    expect(byId['spin-360'].status).toBe('withheld');
    expect(byId['model-3d'].status).toBe('withheld');
    expect(byId['fulfillment-care-returns'].status).toBe('withheld');
    expect(JSON.stringify(sequence)).not.toContain('unapproved-back');
  });

  it('does not turn unapproved campaign or fulfillment data into authority', () => {
    const sequence = projectPodpipeSequence({
      campaign: {
        assetId: 'candidate-campaign',
        src: '/media/editorial/candidate.png',
        alt: 'Candidate',
        approvalStatus: 'pending',
        sourceAuthority: 'approved-campaign-registry',
      },
      fulfillment: {
        approvalStatus: 'pending',
        sourceAuthority: 'approved-product-release-record',
        data: {
          production: 'Invented production copy',
          delivery: 'Invented delivery copy',
          care: 'Invented care copy',
          returns: 'Invented returns copy',
          fulfillment: 'Invented fulfillment copy',
        },
      },
    });
    expect(
      sequence.find((section) => section.id === 'campaign-opening').status
    ).toBe('withheld');
    expect(
      sequence.find((section) => section.id === 'fulfillment-care-returns')
        .status
    ).toBe('withheld');
    expect(JSON.stringify(sequence)).not.toContain('Invented care copy');
  });
});
