'use client';

import Image from 'next/image';
import { useState } from 'react';

const angles = [
  {
    src: '/media/draft-signature-hoodie/01-factual-apliiq-front.png',
    label: 'Front — factual Apliiq/POD source',
  },
  {
    src: '/media/draft-signature-hoodie/02-ai-left-three-quarter.png',
    label: 'Left three-quarter — AI-assisted Draft',
  },
  {
    src: '/media/draft-signature-hoodie/04-ai-back.png',
    label: 'Back — AI-assisted Draft',
  },
  {
    src: '/media/draft-signature-hoodie/03-ai-right-three-quarter.png',
    label: 'Right three-quarter — AI-assisted Draft',
  },
] as const;

const editorials = [
  {
    src: '/media/draft-signature-hoodie/runway-hero-wide-v1.png',
    alt: 'AI editorial hero showing the Signature Hoodie in a concrete runway corridor',
    label: 'Runway hero',
  },
  {
    src: '/media/draft-signature-hoodie/runway-front-v1.png',
    alt: 'AI on-model front editorial study in a concrete corridor',
    label: 'On-model front',
  },
  {
    src: '/media/draft-signature-hoodie/runway-three-quarter-v1.png',
    alt: 'AI on-model three-quarter editorial study in a concrete corridor',
    label: 'On-model three-quarter',
  },
  {
    src: '/media/draft-signature-hoodie/concrete-product-still-v1.png',
    alt: 'AI concrete product still for the Signature Hoodie',
    label: 'Concrete product still',
  },
] as const;

export function SignatureHoodieMediaLab() {
  const [angle, setAngle] = useState(0);
  const activeAngle = angles[angle];

  return (
    <main className="cp-media-lab">
      <div className="cp-media-lab-shell">
        <p className="cp-media-lab-kicker">
          CARLOPHILLIPS / Local media lab
        </p>
        <div className="cp-media-lab-intro">
          <div>
            <h1 className="cp-media-lab-title">
              Signature Hoodie<br />
              Media System
            </h1>
            <p className="cp-media-lab-intro-copy">
              Private local review only. These are AI-assisted visual studies and
              a factual front reference—not customer-facing product proof, not
              Shopify media, and not a live storefront release.
            </p>
          </div>
          <p className="cp-media-lab-intro-label">
            2D editorial / 360 motion study / 2.5D angle viewer
          </p>
        </div>

        <section className="cp-media-lab-admin" aria-labelledby="media-generation-title">
          <div>
            <p className="cp-media-lab-section-label">Admin / Media Generation</p>
            <h2 id="media-generation-title" className="cp-media-lab-heading">Generation control plane</h2>
            <p className="cp-media-lab-intro-copy">Draft-only generation jobs are listed with truth labels and approval state. This review surface does not publish or change storefront media.</p>
          </div>
          <div className="cp-media-lab-jobs" role="list" aria-label="Media generation jobs">
            {[
              ['Runway motion', 'AI-assisted motion', 'Ready for review'],
              ['Fit and silhouette', 'AI-assisted motion', 'Ready for review'],
              ['Four-angle study', 'Approximate 360', 'Disclosure required'],
            ].map(([name, truth, state]) => (
              <article key={name} role="listitem" className="cp-media-lab-job">
                <div><strong>{name}</strong><span>{truth}</span></div>
                <span className="cp-media-lab-job-state">{state}</span>
                <div className="cp-media-lab-job-actions"><button type="button" disabled>Regenerate</button><button type="button" disabled>Approve</button><button type="button" disabled>Quarantine</button></div>
              </article>
            ))}
          </div>
        </section>

        <section className="cp-media-lab-motion-grid">
          <div>
            <p className="cp-media-lab-section-label">
              01 / 360 motion study
            </p>
            <div className="cp-media-lab-portrait">
              <Image
                src="/media/draft-signature-hoodie/signature-hoodie-draft-360.gif"
                alt="AI-assisted four-angle Signature Hoodie motion study"
                fill
                unoptimized
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="cp-media-lab-product-image"
              />
            </div>
            <p className="cp-media-lab-caption">
              Looping four-angle visual study. It is a presentation prototype,
              not a factual photographed 360 spin.
            </p>
          </div>

          <div>
            <p className="cp-media-lab-section-label">
              02 / Interactive 2.5D angle view
            </p>
            <div className="cp-media-lab-portrait">
              <Image
                src={activeAngle.src}
                alt={activeAngle.label}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="cp-media-lab-product-image"
              />
            </div>
            <div className="cp-media-lab-slider-row">
              <input
                aria-label="Signature Hoodie angle"
                className="cp-media-lab-slider"
                max={angles.length - 1}
                min="0"
                onChange={(event) => setAngle(Number(event.target.value))}
                step="1"
                type="range"
                value={angle}
              />
              <span className="cp-media-lab-slider-count">
                {String(angle + 1).padStart(2, '0')} / 04
              </span>
            </div>
            <p className="cp-media-lab-caption">{activeAngle.label}</p>
            <p className="cp-media-lab-note">
              The prepared GLB remains a separate Draft geometry file. This
              viewer intentionally shows its image-source truth rather than
              misrepresenting it as a garment scan or AR-accurate model.
            </p>
          </div>
        </section>

        <section className="cp-media-lab-editorial">
          <div className="cp-media-lab-editorial-header">
            <div>
              <p className="cp-media-lab-section-label">
                03 / Editorial system
              </p>
              <h2 className="cp-media-lab-heading">
                Concrete runway studies
              </h2>
            </div>
            <p className="cp-media-lab-editorial-note">
              Background direction comes from the supplied concrete still and
              runway references; final images are labelled AI editorial.
            </p>
          </div>
          <div className="cp-media-lab-editorial-grid">
            {editorials.map((item, index) => (
              <figure
                key={item.src}
                className={
                  index === 0
                    ? 'cp-media-lab-editorial-hero'
                    : 'cp-media-lab-editorial-card'
                }
              >
                <div
                  className={
                    index === 0
                      ? 'cp-media-lab-editorial-hero-media'
                      : 'cp-media-lab-editorial-card-media'
                  }
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    unoptimized
                    sizes={index === 0 ? '100vw' : '(max-width: 640px) 100vw, 50vw'}
                    className="cp-media-lab-editorial-image"
                  />
                </div>
                <figcaption className="cp-media-lab-editorial-caption">
                  {item.label} / AI editorial Draft
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
