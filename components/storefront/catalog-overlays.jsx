'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';
import { useDialogLifecycle } from './dialog-lifecycle.js';

/*
 * Screens 07 / 08 — All Categories Grid and Product Grid.
 *
 * One overlay serves both: identical geometry, a heading with its count, a close control, and a
 * three-across card grid whose active card is outlined and marked (viewing). A card with nothing
 * released is present but inert, so the grid shows the shape of the collection without implying
 * that an unreleased group can be opened.
 */
export function CatalogGridOverlay({
  cards,
  labelledById,
  meta,
  onClose,
  onOrder = null,
  open,
  priceLabel = '',
  title,
}) {
  const dialogRef = useRef(null);
  useDialogLifecycle({ open, onClose, dialogRef });
  if (!open) return null;

  return (
    <section
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
      className="cp-catalog-overlay"
      data-catalog-overlay="open"
    >
      <div className="cp-catalog-overlay-panel">
        <header className="cp-catalog-overlay-head">
          <div className="cp-catalog-overlay-heading">
            <h2 id={labelledById} className="cp-catalog-overlay-title">{title}</h2>
            <span className="cp-catalog-overlay-meta">{meta}</span>
          </div>
          <div className="cp-catalog-overlay-controls">
            {onOrder && <button type="button" onClick={onOrder} className="cp-media-order-action">Order — {priceLabel}</button>}
            <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label={`Close ${title.toLowerCase()} overlay`}>
              <X className="cp-icon cp-icon-medium" />
            </button>
          </div>
        </header>

        <div className="cp-catalog-overlay-grid">
          {cards.map(card => {
            const body = (
              <>
                <span className="cp-catalog-overlay-media">
                  {card.imageUrl && (
                    <Image
                      src={card.imageUrl}
                      alt={card.imageAlt}
                      fill
                      sizes={designSystemRuntimeContract.imageSizes.catalogStandard}
                      className="cp-catalog-overlay-image"
                    />
                  )}
                </span>
                <span className="cp-catalog-overlay-name">
                  {card.name}
                </span>
                <span className="cp-catalog-overlay-count">{card.meta}</span>
              </>
            );
            const className = card.viewing
              ? 'cp-catalog-overlay-card cp-catalog-overlay-card-active'
              : 'cp-catalog-overlay-card';

            return card.available && card.href
              ? <Link key={card.id} href={card.href} onClick={onClose} className={className}>{body}</Link>
              : <span key={card.id} aria-disabled="true" className={`${className} cp-catalog-overlay-card-inert`}>{body}</span>;
          })}
        </div>
      </div>
    </section>
  );
}
