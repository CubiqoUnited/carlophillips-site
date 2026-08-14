import Image from 'next/image';
import Link from 'next/link';
import { designSystemRuntimeContract } from '@/lib/design-system/runtime-contract';

export const metadata = {
  title: 'Landing Concept Preview | CARLOPHILLIPS',
  robots: { index: false, follow: false },
};

const studies = [
  {
    src: '/products/signature-hoodie/candidates/ai-assisted/on-model-front-study.png',
    eyebrow: 'Design study / 001',
    title: 'The Signature',
    detail: 'Heavyweight fleece · Tonal embroidery',
    position: 'cp-media-position-center',
  },
  {
    src: '/campaigns/draft-pod/signature-hoodie-desktop-v1.jpg',
    eyebrow: 'Campaign study / 002',
    title: 'Quiet structure',
    detail: 'Monochrome · Everyday uniform',
    position: 'cp-media-position-concept-feature',
  },
  {
    src: '/campaigns/draft-pod/edge-of-life-runway-mobile-v1.jpg',
    eyebrow: 'Runway study / 003',
    title: 'Graphic form',
    detail: 'Bounded print · Limited palette',
    position: 'cp-media-position-center',
  },
];

export default function ConceptPreviewPage() {
  return (
    <main className="cp-concept-page">
      <div className="cp-concept-header">
        <div className="cp-concept-header-inner cp-shell-wide">
          <span className="cp-concept-wordmark">CARLOPHILLIPS</span>
          <div className="cp-concept-header-actions">
            <span className="cp-label cp-concept-header-label">
              Private concept preview
            </span>
            <Link
              href="/"
              className="cp-action cp-action-outline cp-concept-current-link"
            >
              Current site
            </Link>
          </div>
        </div>
      </div>

      <section className="cp-concept-hero" aria-labelledby="concept-hero-title">
        <picture>
          <source media={designSystemRuntimeContract.media.tabletMax} srcSet="/campaigns/draft-pod/edge-of-life-runway-mobile-v1.jpg" />
          <Image
            src="/campaigns/draft-pod/edge-of-life-runway-desktop-v1.jpg"
            alt="Conceptual CARLOPHILLIPS runway staged against dark coastal mountains"
            fill
            priority
            sizes={designSystemRuntimeContract.imageSizes.fullViewport}
            className="cp-media-fit-cover cp-media-position-center"
          />
        </picture>
        <div className="cp-concept-hero-scrim" />

        <div className="cp-concept-hero-content cp-shell-wide">
          <div className="cp-concept-hero-copy">
            <p className="cp-label cp-text-copy cp-space-after-label">
              CARLOPHILLIPS / Lofoten study
            </p>
            <h1 id="concept-hero-title" className="cp-concept-title">
              At the<br />edge of life.
            </h1>
            <div className="cp-concept-hero-actions">
              <a
                href="#collection-study"
                className="cp-action cp-action-solid"
              >
                Discover the study
              </a>
              <span className="cp-label cp-text-soft">
                Campaign concept / Not for sale
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="collection-study" className="cp-concept-collection cp-shell-wide">
        <header className="cp-concept-section-header">
          <div>
            <p className="cp-label-small cp-concept-section-eyebrow">First forms</p>
            <h2 className="cp-concept-section-title">Three directions.</h2>
          </div>
          <p className="cp-body cp-concept-section-copy">
            A visual proposal for the landing experience. Product details remain provisional until supplier templates and physical samples are approved.
          </p>
        </header>

        <div className="cp-concept-grid">
          {studies.map(study => (
            <article key={study.title}>
              <div className="cp-concept-card cp-concept-card-media">
                <Image
                  src={study.src}
                  alt={`${study.title} CARLOPHILLIPS concept study`}
                  fill
                  sizes={designSystemRuntimeContract.imageSizes.conceptCard}
                  className={`cp-media-fit-cover ${study.position}`}
                />
                <div className="cp-editorial-scrim" />
                <div className="cp-concept-card-copy">
                  <p className="cp-label-small cp-concept-card-eyebrow">{study.eyebrow}</p>
                  <h3 className="cp-concept-section-title cp-concept-card-title">{study.title}</h3>
                  <p className="cp-label cp-text-soft cp-concept-card-detail">{study.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cp-concept-story">
        <div className="cp-concept-story-layout cp-shell-wide">
          <div className="cp-concept-story-heading">
            <p className="cp-label-small cp-concept-story-eyebrow">The proposed landing story</p>
            <h2 className="cp-concept-title cp-concept-story-title">
              One cinematic entrance.<br />Three credible forms.
            </h2>
          </div>
          <div className="cp-concept-story-copy cp-body">
            <p>Hero campaign image first. Product-focused studies second. Commerce appears only after the release gates confirm real product truth.</p>
          </div>
        </div>
      </section>

      <footer className="cp-concept-footer cp-shell-wide cp-label-small">
        <span>CARLOPHILLIPS / Private preview</span>
        <span>AI-assisted concept media · Draft only</span>
      </footer>
    </main>
  );
}
