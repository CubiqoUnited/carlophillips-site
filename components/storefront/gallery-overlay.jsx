'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';
import { EXCEPTION_STATES, ExceptionWidget } from './exception-widget.jsx';
import { dialogFocusableSelector, lockDocumentScroll, moveDialogFocus } from './dialog-lifecycle.js';

/*
 * Screens 05 / 06 / 20 — Discovery overlay gallery.
 *
 * The overlay sits over a dimmed discovery page that stays visible around it. The workbook fixes the
 * furniture: an ORDER pill and close at the top, previous/next at the sides, the `01 / 14` position
 * with its dashes under the frame, a dense thumbnail rail beneath that, and the category rail that
 * separates same-model, merchandise, detail and the optional 2.5D view.
 */
export const GALLERY_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'same-model', label: 'Same-model' }),
  Object.freeze({ id: 'merchandise', label: 'Merchandise' }),
  Object.freeze({ id: 'detail', label: 'Detail' }),
  Object.freeze({ id: 'interactive', label: '2.5D viewer' }),
]);

/*
 * Category assignment is derived from the reviewed label and media kind, never invented. A view that
 * does not describe itself as on-body, product-alone or a close-up stays in same-model rather than
 * being promoted into a category whose evidence rules are stricter.
 */
export function galleryCategoryFor(item) {
  const label = `${item.label || ''}`.toLowerCase();
  if (item.interactive) return 'interactive';
  if (label.includes('material') || label.includes('embroidery') || label.includes('detail')) return 'detail';
  if (label.includes('flat lay') || label.includes('flat-lay') || label.includes('product-alone') || label.includes('360')) return 'merchandise';
  return 'same-model';
}

const ALL_MEDIA = '';

export function ProductMediaOverlay({
  activeIndex = 0,
  interactive = true,
  media,
  onActiveIndex = () => {},
  onClose,
  onOrder = null,
  open,
  priceLabel = '',
  title,
}) {
  const dialogRef = useRef(null);
  const trackRef = useRef(null);
  const activeIndexRef = useRef(activeIndex);
  const [category, setCategory] = useState(ALL_MEDIA);
  activeIndexRef.current = activeIndex;

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    media.forEach(item => {
      const id = galleryCategoryFor(item);
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    return counts;
  }, [media]);

  const visible = useMemo(
    () => category === ALL_MEDIA ? media : media.filter(item => galleryCategoryFor(item) === category),
    [category, media]
  );

  useEffect(() => {
    if (!open) return undefined;
    const releaseDocumentScroll = lockDocumentScroll();
    const frame = requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: activeIndexRef.current * (trackRef.current?.clientWidth || 0) });
      dialogRef.current?.querySelector(dialogFocusableSelector)?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      releaseDocumentScroll();
    };
  }, [open]);

  useEffect(() => {
    dialogRef.current?.querySelectorAll('video').forEach(video => {
      if (Number(video.dataset.mediaIndex) !== activeIndex) video.pause();
    });
  }, [activeIndex]);

  const moveTo = useCallback(nextIndex => {
    const index = Math.max(0, Math.min(nextIndex, visible.length - 1));
    const track = trackRef.current;
    if (!track) return;
    const reducedMotion = window.matchMedia(designSystemRuntimeContract.media.reducedMotion).matches;
    track.scrollTo({
      left: index * track.clientWidth,
      behavior: reducedMotion
        ? designSystemRuntimeContract.behavior.instantScroll
        : designSystemRuntimeContract.behavior.smoothScroll,
    });
    onActiveIndex(index);
  }, [onActiveIndex, visible.length]);

  const handleScroll = event => {
    const track = event.currentTarget;
    if (!track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (activeIndex !== index) onActiveIndex(index);
  };

  useEffect(() => {
    if (!open || !interactive) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveTo(activeIndex - 1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveTo(activeIndex + 1);
        return;
      }
      if (event.key === 'Tab') moveDialogFocus(event, dialogRef.current);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, interactive, moveTo, onClose, open]);

  if (!open) return null;

  const selectCategory = next => {
    setCategory(next);
    onActiveIndex(0);
    requestAnimationFrame(() => trackRef.current?.scrollTo({ left: 0 }));
  };

  return (
    <section
      id="product-media-overlay"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-media-title"
      tabIndex={-1}
      className="cp-media-dialog"
      data-product-media-overlay="open"
      inert={interactive ? undefined : true}
    >
      <div className="cp-media-panel">
        <header className="cp-media-dialog-header">
          <h2 id="product-media-title" className="cp-visually-hidden">{title} media viewer</h2>
          {onOrder && <button type="button" onClick={onOrder} className="cp-media-order-action">Order — {priceLabel}</button>}
          <button type="button" onClick={onClose} className="cp-media-icon-button cp-media-close" aria-label="Close product media viewer">
            <X className="cp-icon cp-icon-medium" />
          </button>
        </header>

        {media.length === 0 ? (
          <ExceptionWidget
            inline
            state={EXCEPTION_STATES.galleryUnavailable}
            actions={[
              { label: 'Return to product', emphasis: 'solid', onAction: onClose },
              { label: 'Contact support', href: '/contact' },
            ]}
          />
        ) : (
          <>
            <div
              ref={trackRef}
              onScroll={handleScroll}
              className="cp-media-track cp-scrollbar-hide"
              aria-label={`${title} media`}
            >
              {visible.map((item, index) => {
                const source = item.src || item.url;
                const previewSource = item.previewUrl || source;
                return (
                  <figure key={`${source}-${index}`} className="cp-media-slide">
                    {item.type === 'video' ? (
                      <video
                        controls
                        preload="metadata"
                        poster={item.posterSrc || previewSource}
                        src={source}
                        data-media-index={index}
                        controlsList="nodownload nofullscreen noremoteplayback"
                        className="cp-media-asset cp-media-fit-contain"
                      />
                    ) : (
                      <Image
                        src={item.posterSrc || source}
                        alt={item.alt}
                        fill
                        priority={index === 0}
                        sizes={designSystemRuntimeContract.imageSizes.galleryAsset}
                        unoptimized={item.unoptimized}
                        className={`cp-media-asset cp-media-asset-image ${item.fit || 'cp-media-fit-contain'} ${item.position || 'cp-media-position-center'}`}
                      />
                    )}
                  </figure>
                );
              })}
            </div>

            <div className="cp-media-position">
              <p className="cp-media-counter" aria-live="polite">
                {String(Math.min(activeIndex + 1, visible.length)).padStart(2, '0')} / {String(visible.length).padStart(2, '0')}
              </p>
              <div className="cp-media-dashes" aria-hidden="true">
                {visible.map((item, index) => (
                  <span
                    key={`dash-${item.src || item.url}-${index}`}
                    className={index === activeIndex ? 'cp-media-dash cp-media-dash-active' : 'cp-media-dash'}
                  />
                ))}
              </div>
            </div>

            <nav className="cp-media-categories" aria-label="Gallery categories">
              <button
                type="button"
                onClick={() => selectCategory(ALL_MEDIA)}
                aria-pressed={category === ALL_MEDIA}
                className={category === ALL_MEDIA ? 'cp-media-category cp-media-category-active' : 'cp-media-category'}
              >
                All
              </button>
              {GALLERY_CATEGORIES.map(entry => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectCategory(entry.id)}
                  disabled={!categoryCounts.get(entry.id)}
                  aria-pressed={category === entry.id}
                  className={category === entry.id ? 'cp-media-category cp-media-category-active' : 'cp-media-category'}
                >
                  {entry.label}
                </button>
              ))}
            </nav>

            <nav className="cp-media-thumbnails cp-scrollbar-hide" aria-label="Media gallery thumbnails">
              {visible.map((item, index) => (
                <button
                  key={`thumb-${item.src || item.url}-${index}`}
                  type="button"
                  onClick={() => moveTo(index)}
                  className={activeIndex === index ? 'cp-media-thumbnail cp-media-thumbnail-active' : 'cp-media-thumbnail'}
                  aria-label={`Jump to view ${index + 1}`}
                  aria-pressed={activeIndex === index}
                >
                  <Image
                    src={item.posterSrc || item.previewUrl || item.src || item.url}
                    alt=""
                    width={36}
                    height={45}
                    className="cp-media-thumbnail-img"
                  />
                </button>
              ))}
            </nav>

            <div className="cp-media-navigation">
              <button
                type="button"
                onClick={() => moveTo(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="cp-media-arrow"
                aria-label="Previous product image"
              >
                <ArrowLeft className="cp-icon cp-icon-medium" />
              </button>
              <button
                type="button"
                onClick={() => moveTo(activeIndex + 1)}
                disabled={activeIndex === visible.length - 1}
                className="cp-media-arrow"
                aria-label="Next product image"
              >
                <ArrowRight className="cp-icon cp-icon-medium" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
