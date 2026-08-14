'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, Text } from '@repo/design-system';
import type { ViewerMediaItem } from '@/lib/media/types';

interface MediaViewerProps {
  media: ViewerMediaItem[];
  open: boolean;
  onClose: () => void;
  title: string;
}

export function MediaViewer({ media, open, onClose, title }: MediaViewerProps) {
  const controlledMedia = media.slice(0, 12);
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setActiveIndex(0);
    requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: 0 });
      dialogRef.current?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || controlledMedia.length === 0) return null;

  const motionIndex = controlledMedia.findIndex(
    (item) => item.type === 'video'
  );
  const moveTo = (nextIndex: number) => {
    const index = Math.max(0, Math.min(nextIndex, controlledMedia.length - 1));
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
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
            <Text role="label">Signature Series / Media</Text>
            {motionIndex >= 0 && (
              <Button variant="quiet" onClick={() => moveTo(motionIndex)}>
                Motion study
              </Button>
            )}
            <h2 id="product-media-title" className="sr-only">
              {title} media viewer
            </h2>
          </div>
          <div className="cp-media-dialog-controls">
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
              <figure key={item.registryAssetId} className="cp-media-slide">
                {item.type === 'video' ? (
                  <video
                    controls
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
                    unoptimized
                    className="cp-media-slide-image"
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
