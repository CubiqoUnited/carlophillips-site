import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Runway Models | CARLOPHILLIPS',
  description: 'Private casting concept roster for CARLOPHILLIPS.',
  robots: { index: false, follow: false },
};

type RunwayModel = {
  name: string;
  role: string;
  representation: string;
  look: string;
  energy: string;
  stats: string;
};

const runwayModels: RunwayModel[] = [
  {
    name: 'Idris Amani',
    role: 'The Anchor',
    representation: 'Black British / West African diaspora',
    look: 'Close-cropped hair, powerful shoulders, sculptural profile.',
    energy: 'Grounded / direct / resolute',
    stats: '188 cm · EU 50 · 79 cm waist',
  },
  {
    name: 'Kenji Arai',
    role: 'The Still',
    representation: 'East Asian / Japanese diaspora',
    look: 'Straight black hair, clean lines, slender athletic silhouette.',
    energy: 'Quiet / exacting / self-contained',
    stats: '184 cm · EU 48 · 76 cm waist',
  },
  {
    name: 'Zayn Qadir',
    role: 'The Observer',
    representation: 'South Asian and West Asian diaspora',
    look: 'Dark curls, refined beard, close-camera texture.',
    energy: 'Thoughtful / magnetic / textured',
    stats: '186 cm · EU 50 · 79 cm waist',
  },
  {
    name: 'Luca Serrano',
    role: 'The Current',
    representation: 'Mixed Latin American heritage',
    look: 'Short textured hair, sharp cheekbones, athletic frame.',
    energy: 'Alert / contemporary / kinetic',
    stats: '182 cm · EU 48 · 78 cm waist',
  },
  {
    name: 'Kairo Okafor',
    role: 'The Origin',
    representation: 'Black diaspora / pan-European campaign context',
    look: 'Short natural curls, tall lean-athletic silhouette.',
    energy: 'Composed / monumental / authoritative',
    stats: '188 cm · EU 50 · 79 cm waist',
  },
  {
    name: 'Samir Vale',
    role: 'The Architect',
    representation: 'West Asian / Middle Eastern diaspora',
    look: 'Dark textured hair, defined features, lean-athletic build.',
    energy: 'Observant / controlled / modern',
    stats: '185 cm · EU 48 · 78 cm waist',
  },
  {
    name: 'Leif Dahl',
    role: 'The Northern Line',
    representation: 'Nordic / Northern European',
    look: 'Ash-blond texture, angular features, tall slim line.',
    energy: 'Remote / atmospheric / restrained',
    stats: '187 cm · EU 48 · 77 cm waist',
  },
  {
    name: 'Miro Kovac',
    role: 'The Edge',
    representation: 'Central or Eastern European',
    look: 'Close-cropped hair, visible tattoo, compact athletic build.',
    energy: 'Raw / direct / self-possessed',
    stats: '183 cm · EU 48–50 · 80 cm waist',
  },
  {
    name: 'Damon Leclerc',
    role: 'The Form',
    representation: 'Western European',
    look: 'Swept-back dark hair, clean shave, tall streamlined build.',
    energy: 'Polished / assured / architectural',
    stats: '187 cm · EU 50 · 78 cm waist',
  },
  {
    name: 'Roman Vale',
    role: 'The Signal',
    representation: 'Southern European / Mediterranean',
    look: 'Dark hair, neat stubble, athletic build.',
    energy: 'Warm / understated / confident',
    stats: '185 cm · EU 48–50 · 79 cm waist',
  },
  {
    name: 'Navid Sayegh',
    role: 'The Drift',
    representation: 'West Asian / Middle Eastern diaspora',
    look: 'Wavy dark hair, sculptural profile, lean frame.',
    energy: 'Introspective / cinematic / intense',
    stats: '186 cm · EU 50 · 79 cm waist',
  },
  {
    name: 'Cruz Ibarra',
    role: 'The Fracture',
    representation: 'Latin American / Iberian diaspora',
    look: 'Short curls, strong brows, athletic build.',
    energy: 'Immediate / grounded / contemporary',
    stats: '183 cm · EU 48–50 · 79 cm waist',
  },
  {
    name: 'Alessio Moretti',
    role: 'The Resolve',
    representation: 'Italian / Mediterranean European',
    look: 'Deep brown hair, softened angular features, lean athletic line.',
    energy: 'Focused / refined / quietly assured',
    stats: '186 cm · EU 50 · 78 cm waist',
  },
];

export default function RunwayModelsPage() {
  return (
    <main id="main-content" className="cp-runway-models-page">
      <header className="cp-runway-models-header">
        <div className="cp-page-shell flex min-h-16 items-center justify-between gap-6">
          <Link href="/" className="cp-wordmark">
            CARLOPHILLIPS
          </Link>
          <p className="cp-label hidden text-right sm:block">Casting / 001</p>
        </div>
      </header>

      <section className="cp-page-shell py-16 sm:py-24">
        <p className="cp-label mb-5">Runway models</p>
        <h1 className="cp-runway-models-title max-w-4xl">
          Thirteen lines of character.
        </h1>
        <p className="cp-runway-models-disclosure cp-body mt-8 max-w-2xl">
          A private, AI-assisted casting study.
          <br />
          Names, stats, and representation notes are fictional.
          <br />
          Not model identities or booking information.
        </p>
      </section>

      <section
        className="cp-page-shell pb-16 sm:pb-24"
        aria-label="Model roster"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {runwayModels.map((model, index) => (
            <article key={model.name} className="group min-w-0">
              <div className="cp-runway-models-card-media relative overflow-hidden">
                <div
                  className="cp-media-withheld absolute inset-0"
                  role="img"
                  aria-label={`${model.name} image withheld pending approval`}
                />
                <span className="cp-runway-models-card-index cp-label absolute left-4 top-4 px-3 py-2">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="cp-runway-models-card-name">{model.name}</h2>
                  <p className="cp-label mt-2">{model.role}</p>
                </div>
                <p className="cp-label max-w-24 pt-1 text-right">
                  {model.stats}
                </p>
              </div>

              <details className="cp-runway-models-card-profile mt-5 pt-4">
                <summary className="cp-runway-models-card-summary cp-label cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  View profile
                </summary>
                <dl className="cp-runway-models-card-details mt-4 grid gap-3">
                  <div>
                    <dt className="cp-label">Casting direction</dt>
                    <dd className="mt-1">{model.representation}</dd>
                  </div>
                  <div>
                    <dt className="cp-label">Look</dt>
                    <dd className="mt-1">{model.look}</dd>
                  </div>
                  <div>
                    <dt className="cp-label">Energy</dt>
                    <dd className="mt-1">{model.energy}</dd>
                  </div>
                </dl>
              </details>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
