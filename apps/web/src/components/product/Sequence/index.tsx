import React from 'react';
import { Layout, MediaFrame, Text } from '@repo/design-system';
import type { PodpipeSection } from '@/lib/media/types';

const sectionTitles: Record<PodpipeSection['id'], string> = {
  'campaign-opening': 'Runway / campaign opening',
  'product-alone': 'Product front and back',
  'on-body-editorial': 'On-body editorial',
  'embroidery-detail': 'Signature embroidery',
  'material-construction-story': 'Material and construction',
  'product-motion': 'Product film and motion preview',
  'spin-360': 'Customer-controlled 360°',
  'model-3d': 'Verified 3D model',
  'construction-details': 'Construction details',
  'shopify-facts': 'Product facts',
  'fulfillment-care-returns': 'Production, delivery, care and returns',
};

export function ProductSequence({ sequence }: { sequence: PodpipeSection[] }) {
  return (
    <Layout as="section" width="wide" spacing="section">
      {sequence.map((section) => (
        <article
          key={section.id}
          className="cp-podpipe-section"
          data-podpipe-position={section.position}
          data-podpipe-section={section.id}
          data-podpipe-status={section.status}
        >
          <header className="cp-podpipe-section-header">
            <Text role="label">
              {String(section.position).padStart(2, '0')} / 11
            </Text>
            <Text as="h2" role="section-heading">
              {sectionTitles[section.id]}
            </Text>
          </header>

          {section.status === 'available' ? (
            <div className="cp-podpipe-content">
              {section.id === 'campaign-opening' &&
                isCampaignData(section.data) && (
                  <MediaFrame aspect="wide">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={section.data.asset.src}
                      alt={section.data.asset.alt}
                    />
                    <div className="cp-podpipe-campaign-copy">
                      <Text as="h3" role="product-heading">
                        {String(section.data.productName)}
                      </Text>
                      <Text role="body">
                        {formatSequencePrice(
                          section.data.price,
                          section.data.currency
                        )}
                      </Text>
                    </div>
                  </MediaFrame>
                )}
              {section.assets.map((asset) => (
                <MediaFrame key={asset.registryAssetId} aspect="portrait">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.alt} />
                </MediaFrame>
              ))}
              {section.data && section.id !== 'campaign-opening' && (
                <dl className="cp-podpipe-facts">
                  {Object.entries(section.data).map(([label, value]) => (
                    <div key={label}>
                      <dt>{label.replaceAll(/([A-Z])/g, ' $1')}</dt>
                      <dd>
                        {Array.isArray(value)
                          ? value.join(', ')
                          : typeof value === 'boolean'
                            ? value
                              ? 'Yes'
                              : 'No'
                            : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ) : (
            <Text tone="muted" role="body">
              {section.status === 'not-applicable'
                ? 'Not applicable — no verified GLB is claimed for this release.'
                : 'No separate asset or additional fact is included in the approved 12-image and 2-video presentation.'}
            </Text>
          )}
        </article>
      ))}
    </Layout>
  );
}

function isCampaignData(data: PodpipeSection['data']): data is NonNullable<
  PodpipeSection['data']
> & {
  asset: { src: string; alt: string };
} {
  if (!data || typeof data.asset !== 'object' || data.asset === null) {
    return false;
  }
  const asset = data.asset as Record<string, unknown>;
  return typeof asset.src === 'string' && typeof asset.alt === 'string';
}

function formatSequencePrice(price: unknown, currency: unknown): string {
  if (typeof price !== 'number' || typeof currency !== 'string') {
    return 'Price withheld';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}
