'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Maximize, X } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Text } from '@repo/design-system';
import type { ViewerMediaItem } from '@/lib/media/types';
import { useModalDialog } from '@/lib/a11y/use-modal-dialog';

interface MediaViewerProps {
  media: ViewerMediaItem[];
  open: boolean;
  onClose: () => void;
  purchaseHref: string;
  title: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export function MediaViewer({
  media,
  open,
  onClose,
  purchaseHref,
  title,
  triggerRef,
}: MediaViewerProps) {
  const controlledMedia = media.slice(0, 12);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useModalDialog(open, dialogRef, triggerRef, onClose);

  useEffect(() => {
    if (!open) return undefined;
    setActiveIndex(0);
    setZoomed(false);
    setAutoPlay(false);
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: 0 });
    });
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || !autoPlay || reducedMotion) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % controlledMedia.length),
      4500
    );
    return () => window.clearInterval(timer);
  }, [autoPlay, controlledMedia.length, open, reducedMotion]);

  useEffect(() => {
    if (!open || !trackRef.current) return;
    trackRef.current.scrollTo({
      left: activeIndex * trackRef.current.clientWidth,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
    trackRef.current.querySelectorAll('video').forEach((video, index) => {
      if (index === activeIndex && autoPlay && !reducedMotion)
        void video.play().catch(() => undefined);
      else video.pause();
    });
  }, [activeIndex, autoPlay, open, reducedMotion]);

  if (!open || controlledMedia.length === 0) return null;

  const moveTo = (nextIndex: number) => {
    const index = Math.max(0, Math.min(nextIndex, controlledMedia.length - 1));
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      left: index * track.clientWidth,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
    setActiveIndex(index);
  };

  return (
    <section
      id="product-media-overlay"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-media-title"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
        if (event.key === 'ArrowLeft') moveTo(activeIndex - 1);
        if (event.key === 'ArrowRight') moveTo(activeIndex + 1);
      }}
      className="cp-media-dialog"
      data-product-media-overlay="open"
      data-view-limit="12"
    >
      <div className="cp-media-panel">
        <header className="cp-media-dialog-header">
          <div className="cp-media-dialog-title">
            <Text role="label">{title} / Media</Text>
            <button
              type="button"
              className="cp-media-text-button"
              onClick={() => setAutoPlay((value) => !value)}
              aria-pressed={autoPlay}
            >
              {autoPlay ? 'Stop auto' : 'Play auto'}
            </button>
            <button
              type="button"
              className="cp-media-text-button"
              onClick={() => setZoomed((value) => !value)}
              aria-pressed={zoomed}
            >
              {zoomed ? 'Reset zoom' : 'Zoom'}
            </button>
            <h2 id="product-media-title" className="sr-only">
              {title} media viewer
            </h2>
          </div>
          <div className="cp-media-dialog-controls">
            <Link
              href={`${purchaseHref}#product-options`}
              className="cp-action cp-action-solid cp-media-purchase-action"
              onClick={onClose}
            >
              CHOOSE A SIZE
            </Link>
            <Text role="label" aria-live="polite">
              {String(activeIndex + 1).padStart(2, '0')} /{' '}
              {String(controlledMedia.length).padStart(2, '0')}
            </Text>
            <button
              type="button"
              onClick={onClose}
              className="cp-media-icon-button"
              aria-label="Close product media viewer"
            >
              <X aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          ref={trackRef}
          onScroll={(event) => {
            const track = event.currentTarget;
            if (track.clientWidth) {
              setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
            }
          }}
          className="cp-media-track"
          aria-label={`${title} media`}
        >
          {controlledMedia.map((item, index) => {
            const source = item.src || item.url;
            const previewSource = item.previewUrl || source;
            return (
              <figure
                key={item.registryAssetId || item.id || `${item.type}-${index}`}
                className="cp-media-slide"
              >
                {item.type === 'video' ? (
                  <video
                    controls
                    autoPlay={
                      autoPlay && !reducedMotion && index === activeIndex
                    }
                    muted
                    playsInline
                    preload="metadata"
                    poster={previewSource}
                    src={source}
                  />
                ) : (
                  <Image
                    src={item.type === 'image' ? source : previewSource}
                    alt={item.alt}
                    fill
                    priority={index === 0}
                    sizes="90vw"
                    className={`cp-media-slide-image ${zoomed && index === activeIndex ? 'is-zoomed' : ''}`}
                  />
                )}
                <figcaption className="cp-media-caption">
                  <span>{item.label}</span>
                  <span>{item.disclosure}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className="cp-media-arrows">
          <button
            type="button"
            onClick={() => moveTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="cp-media-arrow"
            aria-label="Previous product image"
          >
            <ArrowLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() =>
              document
                .querySelectorAll<HTMLElement>('.cp-media-slide')
                [activeIndex]?.requestFullscreen?.()
            }
            className="cp-media-arrow"
            aria-label="Open active media fullscreen"
          >
            <Maximize aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => moveTo(activeIndex + 1)}
            disabled={activeIndex === controlledMedia.length - 1}
            className="cp-media-arrow"
            aria-label="Next product image"
          >
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
