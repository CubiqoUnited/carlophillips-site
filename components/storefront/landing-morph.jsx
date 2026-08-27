'use client';

import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';

/*
 * Screens 01 / 02 — Landing, pre-morph and post-morph.
 *
 * "ENTER starts the leftward landing-panel reveal; the logo, copy and CTA travel with the panel.
 * The black panel translates left; video remains stationary beneath it. No fade, flash or
 * fullscreen."
 *
 * The video never moves and never changes opacity: only the panel and the copy carried on it are
 * transformed. The copy counter-travels a shorter distance than the panel, so it settles at the
 * left of the frame instead of leaving with it — the difference between the two mocks.
 *
 * `hero` is a media readiness decision. When it clears motion the hero plays; when it is poster-only
 * the same still renders, which is also what a reduced-motion visitor sees. Nothing else is drawn.
 */
function ShieldCrest({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 56"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M20 4L24 1L28 4L32 2L30 8H18L16 2L20 4Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M10 9H38C38 9 39 28 24 49C9 28 10 9 10 9ZM12 11H36C36 11 37 27 24 46C11 27 12 11 12 11Z" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontSize="13"
        fontWeight="600"
        letterSpacing="1.5"
      >
        CP
      </text>
    </svg>
  );
}

export function LandingMorph({ entered, hero, onEnter }) {
  const enterButtonRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    if (window.matchMedia(designSystemRuntimeContract.media.reducedMotion).matches) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, [hero?.sourceUrl]);

  return (
    <section
      id="landing-hero"
      className="cp-landing"
      data-landing-state={entered ? 'post-morph' : 'pre-morph'}
      aria-label="CARLOPHILLIPS runway campaign"
    >
      <div className="cp-landing-media" aria-hidden={entered ? undefined : true}>
        {hero?.motionAllowed && hero.sourceUrl ? (
          <video
            ref={videoRef}
            src={hero.sourceUrl}
            poster={hero.posterUrl || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            aria-label={hero.alt}
            className="cp-landing-video cp-landing-scene"
          />
        ) : hero?.posterUrl ? (
          <Image
            src={hero.posterUrl}
            alt={hero.alt}
            fill
            priority
            sizes={designSystemRuntimeContract.imageSizes.fullViewport}
            className="cp-landing-still cp-landing-scene"
          />
        ) : null}
        <div className="cp-landing-scrim" aria-hidden="true" />
      </div>

      <div className="cp-landing-panel" aria-hidden={entered ? true : undefined} />
      <div className="cp-landing-edge-blend" aria-hidden="true" />

      <div className="cp-landing-copy">
        <ShieldCrest className="cp-landing-emblem" />
        <p className="cp-landing-crest">CARLO PHILLIPS</p>
        <p className="cp-eyebrow cp-landing-origin">Lofoten · Norway</p>
        <div className="cp-landing-over">at the</div>
        <h1 className="cp-display cp-landing-title">
          At the<br />edge of life.
        </h1>
        <div className="cp-landing-sig">with carlophillips</div>
        <p className="cp-eyebrow cp-landing-caption">Runway 001 / Lofoten</p>
        <button
          ref={enterButtonRef}
          type="button"
          onClick={onEnter}
          className="cp-landing-enter cp-landing-scroll"
          aria-label="Scroll to product discovery"
          aria-controls="signature-runway"
        >
          <span className="cp-landing-scroll-arrow" aria-hidden="true">↓</span>
          <span className="cp-visually-hidden">Enter</span>
          <ArrowRight className="cp-icon cp-icon-small cp-visually-hidden" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
