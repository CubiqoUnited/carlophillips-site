'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import runwayDesktop from '../../../public/media/editorial/runway-editorial-realism-cross-frame-warm-entry-cachefix-v6.png';
import runwayMobile from '../../../public/media/editorial/runway-editorial-realism-tablet-warm-entry-cachefix-v6.png';

export default function HeroMorphPreview({
  embedded = false,
  revealed: controlledRevealed,
  onReveal,
  onExplore,
  onMenu,
  onBag,
}: {
  variant?: 'editorial' | 'rugged';
  embedded?: boolean;
  revealed?: boolean;
  onReveal?: () => void;
  onExplore?: () => void;
  onMenu?: () => void;
  onBag?: () => void;
}) {
  const [previewRevealed, setPreviewRevealed] = useState(false);
  const revealed = controlledRevealed ?? previewRevealed;
  const Root = embedded ? 'section' : 'main';

  useEffect(() => {
    if (revealed) return;
    const delayToken = getComputedStyle(document.documentElement)
      .getPropertyValue('--cp-delay-hero-preview')
      .trim();
    const delay = delayToken.endsWith('ms')
      ? Number.parseFloat(delayToken)
      : Number.parseFloat(delayToken) * 1000;
    const timer = window.setTimeout(
      () => {
        if (controlledRevealed === undefined) setPreviewRevealed(true);
        else onReveal?.();
      },
      Number.isFinite(delay) ? delay : 1250
    );
    return () => window.clearTimeout(timer);
  }, [controlledRevealed, onReveal, revealed]);

  return (
    <Root
      className={`cp-hero-preview${embedded ? ' is-embedded' : ''}${revealed ? ' is-revealed' : ''}`}
      id={embedded ? 'landing-hero' : 'main-content'}
      aria-label={embedded ? 'Landing' : undefined}
    >
      <picture className="cp-hero-preview-scene">
        <source media="(max-width: 900px)" srcSet={runwayMobile.src} />
        <Image
          src={runwayDesktop}
          alt="Carlo Phillips runway in Lofoten, Norway"
          fill
          priority
          sizes="75vw"
          className="cp-hero-preview-image"
        />
      </picture>

      <div className="cp-hero-preview-curtain" aria-hidden="true" />
      <div className="cp-hero-preview-edge-blend" aria-hidden="true" />

      <header className="cp-hero-preview-nav">
        <button type="button" onClick={onMenu} aria-label="Open menu">
          <span aria-hidden="true">☰</span>
          <span>MENU</span>
        </button>
        <span className="cp-hero-preview-brand">CARLOPHILLIPS</span>
        <button type="button" onClick={onBag}>
          BAG 0
        </button>
      </header>

      <section
        className="cp-hero-preview-copy"
        aria-label="At the Edge Of Life with Carlo Phillips"
      >
        <p className="cp-hero-preview-overline">at the</p>
        <h1>Edge Of Life</h1>
        <p className="cp-hero-preview-signature">with carlophillips</p>
      </section>

      <button
        type="button"
        className="cp-hero-preview-scroll"
        onClick={onExplore}
        aria-label="Explore the first product"
      >
        <span aria-hidden="true">↓</span>
      </button>
    </Root>
  );
}
