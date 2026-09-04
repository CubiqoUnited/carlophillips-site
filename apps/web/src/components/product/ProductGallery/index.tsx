'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MediaViewer } from '../MediaViewer';
import type { ViewerMediaItem } from '@/lib/media/types';
import type { MediaReview } from '@/types';

export function ProductGallery({
  media,
  mediaReview = null,
  customerFacing = false,
  productTitle = 'Product',
  productOnly = false,
}: {
  media: ViewerMediaItem[];
  mediaReview?: MediaReview | null;
  customerFacing?: boolean;
  productTitle?: string;
  productOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const productMedia = productOnly
    ? media.filter(
        (item) =>
          !item.onBodyPose &&
          !item.modalities.some((modality) =>
            ['on-model', 'lifestyle'].includes(modality)
          )
      )
    : media;
  // Shopify's second approved image is the editorial, neutral-canvas lead.
  // Keep every source image available in the gallery while avoiding the raw
  // supplier-white cutout as the customer-facing hero.
  const visibleMedia =
    productOnly && productMedia.length > 1
      ? [productMedia[1], productMedia[0], ...productMedia.slice(2)]
      : productMedia;
  if (visibleMedia.length === 0) {
    return (
      <div
        className="cp-product-gallery-empty cp-surface-raised cp-text-muted flex flex-col items-center justify-center gap-4 p-10 text-center text-sm"
        data-media-review={mediaReview?.status || 'incomplete'}
      >
        <p>No approved product media was returned by the selected source.</p>
        {mediaReview && (
          <p className="cp-label-small max-w-xl font-mono">
            Media review incomplete — missing:{' '}
            {mediaReview.missingModalities.join(', ') || 'approved fallback'}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className="cp-product-gallery-grid cp-grid-rule grid lg:grid-cols-2"
        data-media-count={visibleMedia.length}
        data-media-review={mediaReview?.status || 'incomplete'}
      >
        {visibleMedia.map((item, index) => (
          <figure
            key={item.id}
            className={
              index === 0
                ? 'cp-card-media-featured lg:col-span-2'
                : 'cp-card-media'
            }
          >
            {item.type === 'image' && (item.url || item.src) ? (
              <button
                type="button"
                className="block h-full w-full"
                onClick={() => setOpen(true)}
                aria-label={`Open ${item.label}`}
              >
                <div
                  className={`${index === 0 ? 'cp-product-media-featured' : 'cp-product-media-portrait'} relative`}
                >
                  <Image
                    src={item.url || item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 52vw, 100vw"
                    className="object-contain object-center p-8 sm:p-12"
                  />
                </div>
              </button>
            ) : item.type === 'video' && (item.url || item.src) ? (
              <video
                controls
                muted
                playsInline
                preload="none"
                poster={item.previewUrl}
                className="h-full w-full object-contain"
                src={item.url || item.src}
              />
            ) : (
              <div className="cp-product-media-portrait cp-text-muted flex items-center justify-center p-8 text-sm">
                Media unavailable
              </div>
            )}
            <figcaption className="cp-label-small cp-surface-canvas cp-rule border-t px-5 py-4">
              {customerFacing
                ? `View ${String(index + 1).padStart(2, '0')}`
                : item.label}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="flex justify-end border-b px-5 py-4">
        <button
          type="button"
          className="cp-action cp-action-outline"
          onClick={() => setOpen(true)}
        >
          View gallery
        </button>
      </div>
      <MediaViewer
        media={visibleMedia}
        open={open}
        onClose={() => setOpen(false)}
        title={productTitle}
      />
    </>
  );
}
