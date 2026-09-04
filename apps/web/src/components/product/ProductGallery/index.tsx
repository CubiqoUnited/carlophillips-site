'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { MediaViewer } from '../MediaViewer';
import type { ViewerMediaItem } from '@/lib/media/types';
import { curateCustomerMedia } from '@/lib/media/customer-product-media';
import type { MediaReview } from '@/types';

export function ProductGallery({
  media,
  mediaReview = null,
  customerFacing = false,
  productTitle = 'Product',
  productHref,
  productOnly = false,
  purchaseLabel,
}: {
  media: ViewerMediaItem[];
  mediaReview?: MediaReview | null;
  customerFacing?: boolean;
  productTitle?: string;
  productHref: string;
  productOnly?: boolean;
  purchaseLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const galleryTriggerRef = useRef<HTMLButtonElement>(null);
  const visibleMedia = productOnly ? curateCustomerMedia(media) : media;
  const previewMedia = visibleMedia.slice(0, 4);
  if (visibleMedia.length === 0) {
    return (
      <div
        className="cp-product-gallery-empty cp-surface-raised cp-text-muted"
        data-media-review={mediaReview?.status || 'incomplete'}
      >
        <p>No approved product media was returned by the selected source.</p>
        {mediaReview && (
          <p className="cp-label-small cp-product-gallery-review">
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
        {previewMedia.map((item, index) => (
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
                className="cp-product-media-trigger"
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
                    className="cp-product-media-image"
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
                className="cp-product-media-video"
                src={item.url || item.src}
              />
            ) : (
              <div className="cp-product-media-portrait cp-product-media-unavailable cp-text-muted">
                Media unavailable
              </div>
            )}
            <figcaption className="cp-label-small cp-surface-canvas cp-product-media-caption">
              {customerFacing
                ? `View ${String(index + 1).padStart(2, '0')}`
                : item.label}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="cp-product-gallery-action">
        <button
          ref={galleryTriggerRef}
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
        purchaseHref={productHref}
        triggerRef={galleryTriggerRef}
        purchaseLabel={purchaseLabel}
      />
    </>
  );
}
