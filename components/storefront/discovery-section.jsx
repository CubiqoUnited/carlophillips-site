'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { ArrowRight, LayoutGrid, Rows3, X } from 'lucide-react';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';
import { DiscoveryVideoStage } from './discovery-stage.jsx';
import { EXCEPTION_STATES, ExceptionWidget } from './exception-widget.jsx';

/*
 * Screens 03 / 04 / 19 — Discovery.
 *
 * Three columns at desktop width: product identity and its three disclosure chips on the left, the
 * 4:5 video stage in the centre, and the VIEW GALLERY / ORDER stack on the right. Activating ORDER
 * replaces that stack in place rather than opening a separate drawer, which is the only difference
 * between screens 03 and 04. Below tablet width the same content stacks: stage first, then copy,
 * then the two full-width action rows.
 */

export function DisclosureChips({ facts }) {
  return (
    <div className="cp-discovery-chips">
      {facts.map(fact => (
        <details key={fact.label} className="cp-discovery-chip">
          <summary className="cp-discovery-chip-summary">{fact.label}</summary>
          <p className="cp-discovery-chip-value">{fact.value}</p>
        </details>
      ))}
    </div>
  );
}

export function SizeChoices({ onSelect, selectedHash, variants }) {
  return (
    <div className="cp-home-size-grid" role="radiogroup" aria-label="Choose size">
      {variants.map(variant => (
        <button
          key={variant.referenceHash}
          type="button"
          role="radio"
          aria-checked={selectedHash === variant.referenceHash}
          disabled={variant.availableForSale === false}
          className={selectedHash === variant.referenceHash ? 'cp-home-size-choice cp-home-size-choice-selected' : 'cp-home-size-choice'}
          onClick={() => onSelect(variant.referenceHash)}
        >
          {variant.sizeLabel}
        </button>
      ))}
    </div>
  );
}

export function OrderPanel({
  description,
  handle,
  onAddToBag,
  onClose,
  onOpenSizeGuide,
  onSelect,
  priceLabel,
  selectedHash,
  variants,
}) {
  const selected = variants.find(variant => variant.referenceHash === selectedHash) || null;
  const unavailable = Boolean(selectedHash) && selected?.availableForSale === false;

  return (
    <section className="cp-order-panel" aria-labelledby="order-panel-title">
      <header className="cp-order-panel-head">
        <h3 id="order-panel-title" className="cp-order-panel-title">Order</h3>
        <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label="Close order panel">
          <X className="cp-icon cp-icon-small" />
        </button>
      </header>
      <p className="cp-order-panel-copy">{description}</p>
      <p className="cp-order-price">{priceLabel}</p>
      <p className="cp-order-panel-label">Select size</p>
      <SizeChoices variants={variants} selectedHash={selectedHash} onSelect={onSelect} />
      <button type="button" onClick={onOpenSizeGuide} className="cp-order-size-guide">Size guide</button>
      {unavailable && <ExceptionWidget inline state={EXCEPTION_STATES.sizeUnavailable} />}
      <div className="cp-order-panel-actions">
        <button
          type="button"
          disabled={!selected || unavailable}
          className="cp-action cp-action-solid cp-order-panel-action"
          onClick={() => onAddToBag(selected)}
        >
          Add to bag
        </button>
        <form method="post" action="/api/checkout" className="cp-order-panel-form">
          <input type="hidden" name="handle" value={handle} />
          <input type="hidden" name="referenceHash" value={selectedHash} />
          <input type="hidden" name="quantity" value="1" />
          <button type="submit" disabled={!selected || unavailable} className="cp-action cp-action-outline cp-order-panel-action">Buy now</button>
        </form>
      </div>
      <p className="cp-order-note">Complimentary shipping &amp; returns</p>
    </section>
  );
}

export function DiscoverySection({
  activeMediaIndex = 0,
  description,
  displayName,
  eyebrow,
  facts,
  galleryButtonRef,
  galleryMedia,
  handle,
  onAddToBag,
  onCloseOrder,
  onOpenCategories,
  onOpenGallery,
  onOpenOrder,
  onOpenProducts,
  onOpenSizeGuide,
  onSelectVariant,
  orderOpen,
  posterOnly,
  priceLabel,
  productClips,
  purchaseReady,
  selectedHash,
  suspended,
  variants,
}) {
  const thumbnails = galleryMedia.slice(0, 9);
  const railPositions = galleryMedia.slice(0, 6);

  return (
    <section id="signature-runway" className="cp-discovery" aria-label="Signature Hoodie runway">
      <div className="cp-discovery-grid cp-page-shell">
        <div className="cp-discovery-lead">
          <p className="cp-eyebrow cp-space-after-label">{eyebrow}</p>
          <h2 className="cp-product-title">{displayName}</h2>
          <p className="cp-product-review cp-space-before-review">{description}</p>
          <DisclosureChips facts={facts} />
        </div>

        <DiscoveryVideoStage
          declaredClips={productClips}
          onOpenGallery={onOpenGallery}
          posterOnly={posterOnly}
          suspended={suspended || orderOpen}
        />

        <div className="cp-discovery-actions">
          {orderOpen && purchaseReady ? (
            <OrderPanel
              description={description}
              handle={handle}
              onAddToBag={onAddToBag}
              onClose={onCloseOrder}
              onOpenSizeGuide={onOpenSizeGuide}
              onSelect={onSelectVariant}
              priceLabel={priceLabel}
              selectedHash={selectedHash}
              variants={variants}
            />
          ) : (
            <>
              {galleryMedia.length > 0 ? (
                <button
                  ref={galleryButtonRef}
                  type="button"
                  onClick={onOpenGallery}
                  aria-haspopup="dialog"
                  aria-controls="product-media-overlay"
                  data-media-trigger="signature-hoodie"
                  className="cp-stack-action"
                >
                  <span>View gallery</span>
                  <span className="cp-stack-action-meta">{galleryMedia.length} images</span>
                </button>
              ) : (
                <Link href="/shop" className="cp-stack-action">
                  <span>Explore the collection</span>
                  <ArrowRight className="cp-icon cp-icon-small" aria-hidden="true" />
                </Link>
              )}
              {purchaseReady && (
                <button type="button" onClick={onOpenOrder} className="cp-stack-action">
                  <span>Order — {priceLabel}</span>
                  <ArrowRight className="cp-icon cp-icon-small" aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="cp-discovery-corner">
        <div className="cp-discovery-corner-actions">
          <button type="button" onClick={onOpenCategories} className="cp-corner-action">
            <span>All categories</span>
          </button>
          <button type="button" onClick={onOpenProducts} className="cp-corner-action">
            <span>All hoodies</span>
          </button>
        </div>
        <ol className="cp-discovery-rail" aria-label="Gallery position">
          {railPositions.map((item, index) => (
            <li key={item.src || item.url || index}>
              <span className={index === activeMediaIndex ? 'cp-discovery-rail-dot cp-discovery-rail-dot-active' : 'cp-discovery-rail-dot'} />
            </li>
          ))}
        </ol>
      </div>

      {thumbnails.length > 0 && (
        <div className="cp-discovery-thumbs cp-scrollbar-hide">
          {thumbnails.map((item, index) => {
            const source = item.posterSrc || item.previewUrl || item.src || item.url;
            return (
              <button
                key={source}
                type="button"
                onClick={() => onOpenGallery(index)}
                aria-label={`Open gallery view ${index + 1}`}
                className={index === activeMediaIndex ? 'cp-discovery-thumb cp-discovery-thumb-active' : 'cp-discovery-thumb'}
              >
                <Image
                  src={source}
                  alt=""
                  fill
                  sizes={designSystemRuntimeContract.imageSizes.discoveryThumb}
                  className="cp-discovery-thumb-image"
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
