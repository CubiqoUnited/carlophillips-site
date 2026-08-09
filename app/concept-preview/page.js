import Image from 'next/image';
import Link from 'next/link';

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
    position: 'object-center',
  },
  {
    src: '/campaigns/draft-pod/signature-hoodie-desktop-v1.jpg',
    eyebrow: 'Campaign study / 002',
    title: 'Quiet structure',
    detail: 'Monochrome · Everyday uniform',
    position: 'object-[72%_center]',
  },
  {
    src: '/campaigns/draft-pod/edge-of-life-runway-mobile-v1.jpg',
    eyebrow: 'Runway study / 003',
    title: 'Graphic form',
    detail: 'Bounded print · Limited palette',
    position: 'object-center',
  },
];

export default function ConceptPreviewPage() {
  return (
    <main className="cp-concept-page">
      <div className="cp-concept-header fixed inset-x-0 top-0 z-40">
        <div className="cp-shell-wide flex h-[var(--cp-header-height)] items-center justify-between">
          <span className="cp-concept-wordmark">CARLOPHILLIPS</span>
          <div className="flex items-center gap-5">
            <span className="cp-label hidden sm:block">
              Private concept preview
            </span>
            <Link
              href="/"
              className="cp-action cp-action-outline min-h-0 px-4 py-2"
            >
              Current site
            </Link>
          </div>
        </div>
      </div>

      <section className="cp-concept-hero relative overflow-hidden" aria-labelledby="concept-hero-title">
        <picture>
          <source media="(max-width: 767px)" srcSet="/campaigns/draft-pod/edge-of-life-runway-mobile-v1.jpg" />
          <Image
            src="/campaigns/draft-pod/edge-of-life-runway-desktop-v1.jpg"
            alt="Conceptual CARLOPHILLIPS runway staged against dark coastal mountains"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </picture>
        <div className="cp-concept-hero-scrim absolute inset-0" />

        <div className="cp-shell-wide cp-concept-hero relative z-10 flex flex-col justify-end pb-12 pt-28 sm:pb-16 lg:pb-20">
          <div className="max-w-[var(--cp-copy-max)]">
            <p className="cp-label cp-text-copy mb-5">
              CARLOPHILLIPS / Lofoten study
            </p>
            <h1 id="concept-hero-title" className="cp-concept-title">
              At the<br />edge of life.
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-4">
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

      <section id="collection-study" className="cp-shell-wide py-20 lg:py-32">
        <header className="cp-rule mb-10 flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="cp-label-small mb-3">First forms</p>
            <h2 className="cp-concept-section-title">Three directions.</h2>
          </div>
          <p className="cp-body max-w-md text-sm leading-6">
            A visual proposal for the landing experience. Product details remain provisional until supplier templates and physical samples are approved.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          {studies.map(study => (
            <article key={study.title} className="group">
              <div className="cp-concept-card cp-concept-card-media relative overflow-hidden">
                <Image
                  src={study.src}
                  alt={`${study.title} CARLOPHILLIPS concept study`}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className={`object-cover ${study.position}`}
                />
                <div className="cp-editorial-scrim absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="cp-label-small mb-2">{study.eyebrow}</p>
                  <h3 className="cp-concept-section-title text-3xl">{study.title}</h3>
                  <p className="cp-label cp-text-soft mt-2">{study.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cp-concept-story">
        <div className="cp-concept-story-layout cp-shell-wide grid gap-10 py-20 lg:items-end lg:py-28">
          <div className="max-w-4xl">
            <p className="cp-label-small mb-4">The proposed landing story</p>
            <h2 className="cp-concept-title cp-concept-story-title">
              One cinematic entrance.<br />Three credible forms.
            </h2>
          </div>
          <div className="cp-concept-story-copy cp-body max-w-sm pl-6 text-sm leading-6">
            <p>Hero campaign image first. Product-focused studies second. Commerce appears only after the release gates confirm real product truth.</p>
          </div>
        </div>
      </section>

      <footer className="cp-shell-wide cp-label-small flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <span>CARLOPHILLIPS / Private preview</span>
        <span>AI-assisted concept media · Draft only</span>
      </footer>
    </main>
  );
}
