/*
 * Media readiness contract.
 *
 * The Screen Inventory Review Workbook requires two motion surfaces:
 *   - the landing video hero behind the black morph panel (16:9 desktop, 9:16 mobile);
 *   - the default product video stage, composed at 4:5, offering the three approved clips.
 *
 * Both must render from an approved master and must keep an optimised first-frame poster for
 * instant render and the reduced-motion fallback. This module is the single decision point for
 * whether either surface may be rendered. It is pure and isomorphic: the probe that inspects the
 * filesystem is injected, so the same rules run in the build script, on the server, and in tests.
 *
 * Fail-closed: unknown is never ready. A slot with no evidence is withheld rather than rendered as
 * a broken player, and the caller raises the appendix "Video unavailable" widget instead.
 */

export const MEDIA_READINESS_SCHEMA = 'cp.media-readiness.v1';

export const MEDIA_READINESS_VERDICT = Object.freeze({
  ready: 'ready',
  posterOnly: 'poster-only',
  notReady: 'not-ready',
});

export const MEDIA_READINESS_REASON = Object.freeze({
  ok: 'ok',
  sourceNotDeclared: 'source-not-declared',
  sourceMissing: 'source-missing',
  sourceEmpty: 'source-empty',
  sourceNotIsoMedia: 'source-not-iso-media',
  posterNotDeclared: 'poster-not-declared',
  posterMissing: 'poster-missing',
  aspectMismatch: 'aspect-mismatch',
});

const ASPECT_TOLERANCE = 0.25;
const MINIMUM_SOURCE_BYTES = 1024;

/*
 * Declared slots. `source.playbackId` stays null until an adaptive-HLS playback identifier is
 * provisioned; the local master is the rendered fallback and the identifier is the only media
 * identity the site would ever store. `product-360-showcase` is declared and deliberately
 * unprovisioned: no approved 360 master exists, so the slot reports not-ready rather than
 * presenting a substitute as a 360 view.
 */
export const MUX_CONFIGURED_PLAYBACK_IDS = Object.freeze({
  'landing-hero-desktop': 'nIt5dac3WbbMBEAFwJogApRtqxgIAWJar3qKOOxrL6I',
  'landing-hero-mobile': 'nIt5dac3WbbMBEAFwJogApRtqxgIAWJar3qKOOxrL6I',
  'product-runway-motion': '1WVN1VPKqCIBMb8hW7R5g5gn01nFOltivagIy1Rjr5y8',
  'product-fit-silhouette': 'mIfRL7Bs4dKarRfC7T01DZjseBjZbQdn3TP39liDmdSc',
});

export const MEDIA_READINESS_SLOTS = Object.freeze([
  Object.freeze({
    slotId: 'landing-hero-desktop',
    role: 'landing-hero',
    label: 'Landing hero / desktop',
    viewport: 'desktop',
    aspect: Object.freeze({ label: '16:9', ratio: 16 / 9 }),
    source: Object.freeze({ playbackId: null, path: 'public/campaigns/lofoten-runway-hero.mp4', publicPath: '/campaigns/lofoten-runway-hero.mp4' }),
    posters: Object.freeze([
      Object.freeze({ format: 'avif', path: 'public/campaigns/lofoten-runway-hero.avif', publicPath: '/campaigns/lofoten-runway-hero.avif' }),
      Object.freeze({ format: 'webp', path: 'public/campaigns/lofoten-runway-hero.webp', publicPath: '/campaigns/lofoten-runway-hero.webp' }),
      Object.freeze({ format: 'png', path: 'public/campaigns/lofoten-runway-hero.png', publicPath: '/campaigns/lofoten-runway-hero.png' }),
    ]),
    alt: 'CARLOPHILLIPS runway campaign staged against a dramatic coastal mountain landscape',
  }),
  Object.freeze({
    slotId: 'landing-hero-mobile',
    role: 'landing-hero',
    label: 'Landing hero / mobile',
    viewport: 'mobile',
    aspect: Object.freeze({ label: '9:16', ratio: 9 / 16 }),
    source: Object.freeze({ playbackId: null, path: 'public/campaigns/lofoten-runway-hero-portrait.mp4', publicPath: '/campaigns/lofoten-runway-hero-portrait.mp4' }),
    posters: Object.freeze([
      Object.freeze({ format: 'avif', path: 'public/campaigns/lofoten-runway-hero-portrait.avif', publicPath: '/campaigns/lofoten-runway-hero-portrait.avif' }),
      Object.freeze({ format: 'webp', path: 'public/campaigns/lofoten-runway-hero-portrait.webp', publicPath: '/campaigns/lofoten-runway-hero-portrait.webp' }),
      Object.freeze({ format: 'png', path: 'public/campaigns/lofoten-runway-hero.png', publicPath: '/campaigns/lofoten-runway-hero.png' }),
    ]),
    alt: 'CARLOPHILLIPS runway campaign staged against a dramatic coastal mountain landscape',
  }),
  Object.freeze({
    slotId: 'product-fit-silhouette',
    role: 'product-video',
    label: 'Fit & silhouette',
    clipOrder: 1,
    aspect: Object.freeze({ label: '4:5', ratio: 4 / 5 }),
    source: Object.freeze({ playbackId: null, path: 'public/media/signature-hoodie/videos/fit-silhouette-final.mp4', publicPath: '/media/signature-hoodie/videos/fit-silhouette-final.mp4' }),
    posters: Object.freeze([
      Object.freeze({ format: 'avif', path: 'public/media/signature-hoodie/posters/fit-silhouette-final.avif', publicPath: '/media/signature-hoodie/posters/fit-silhouette-final.avif' }),
      Object.freeze({ format: 'webp', path: 'public/media/signature-hoodie/posters/fit-silhouette-final.webp', publicPath: '/media/signature-hoodie/posters/fit-silhouette-final.webp' }),
      Object.freeze({ format: 'jpeg', path: 'public/media/signature-hoodie/posters/fit-silhouette-final.jpg', publicPath: '/media/signature-hoodie/posters/fit-silhouette-final.jpg' }),
    ]),
    alt: 'AI editorial fit and silhouette study of the black CARLOPHILLIPS Signature Hoodie in a concrete studio',
    disclosure: 'AI editorial · Staging approved',
  }),
  Object.freeze({
    slotId: 'product-runway-motion',
    role: 'product-video',
    label: 'Runway motion',
    clipOrder: 2,
    aspect: Object.freeze({ label: '4:5', ratio: 4 / 5 }),
    source: Object.freeze({ playbackId: null, path: 'public/media/signature-hoodie/videos/runway-motion-final.mp4', publicPath: '/media/signature-hoodie/videos/runway-motion-final.mp4' }),
    posters: Object.freeze([
      Object.freeze({ format: 'avif', path: 'public/media/signature-hoodie/posters/runway-motion-final.avif', publicPath: '/media/signature-hoodie/posters/runway-motion-final.avif' }),
      Object.freeze({ format: 'webp', path: 'public/media/signature-hoodie/posters/runway-motion-final.webp', publicPath: '/media/signature-hoodie/posters/runway-motion-final.webp' }),
      Object.freeze({ format: 'jpeg', path: 'public/media/signature-hoodie/posters/runway-motion-final.jpg', publicPath: '/media/signature-hoodie/posters/runway-motion-final.jpg' }),
    ]),
    alt: 'AI editorial runway motion showing the black CARLOPHILLIPS Signature Hoodie in a concrete studio',
    disclosure: 'AI editorial · Staging approved',
  }),
  Object.freeze({
    slotId: 'product-360-showcase',
    role: 'product-video',
    label: '360 showcase',
    clipOrder: 3,
    aspect: Object.freeze({ label: '4:5', ratio: 4 / 5 }),
    source: Object.freeze({ playbackId: null, path: null, publicPath: null }),
    posters: Object.freeze([]),
    alt: 'Approved 360 showcase of the CARLOPHILLIPS Signature Hoodie',
    disclosure: 'Awaiting an approved 360 master',
  }),
]);

function firstPresentPoster(slot, probe) {
  for (const poster of slot.posters) {
    const observation = probe(poster.path);
    if (observation?.exists) return { ...poster, bytes: observation.bytes ?? null };
  }
  return null;
}

function aspectMatches(declaredRatio, observation) {
  if (!observation?.width || !observation?.height) return true;
  return Math.abs(observation.width / observation.height - declaredRatio) <= ASPECT_TOLERANCE;
}

function evaluateSource(slot, probe) {
  const source = slot.source;
  if (source?.playbackId) return { renderable: true, reason: MEDIA_READINESS_REASON.ok, playbackId: source.playbackId, publicPath: source.publicPath ?? null };
  if (!source?.path) return { renderable: false, reason: MEDIA_READINESS_REASON.sourceNotDeclared, playbackId: null, publicPath: null };

  const observation = probe(source.path);
  if (!observation?.exists) return { renderable: false, reason: MEDIA_READINESS_REASON.sourceMissing, playbackId: null, publicPath: null };
  if ((observation.bytes ?? 0) < MINIMUM_SOURCE_BYTES) return { renderable: false, reason: MEDIA_READINESS_REASON.sourceEmpty, playbackId: null, publicPath: null };
  if (observation.isoMedia === false) return { renderable: false, reason: MEDIA_READINESS_REASON.sourceNotIsoMedia, playbackId: null, publicPath: null };
  if (!aspectMatches(slot.aspect.ratio, observation)) return { renderable: false, reason: MEDIA_READINESS_REASON.aspectMismatch, playbackId: null, publicPath: source.publicPath };

  return { renderable: true, reason: MEDIA_READINESS_REASON.ok, playbackId: null, publicPath: source.publicPath, bytes: observation.bytes ?? null };
}

/*
 * A slot is `ready` only when an approved source AND a first-frame poster are both verified: without
 * the poster there is no instant render and no reduced-motion still, which the workbook requires. A
 * verified poster with an unrenderable source degrades to `poster-only`. Anything else is withheld.
 */
export function evaluateSlotReadiness(slot, probe) {
  const source = evaluateSource(slot, probe);
  const poster = firstPresentPoster(slot, probe);
  const posterReason = slot.posters.length === 0
    ? MEDIA_READINESS_REASON.posterNotDeclared
    : MEDIA_READINESS_REASON.posterMissing;

  let verdict = MEDIA_READINESS_VERDICT.notReady;
  let reason = source.reason;

  if (source.renderable && poster) {
    verdict = MEDIA_READINESS_VERDICT.ready;
    reason = MEDIA_READINESS_REASON.ok;
  } else if (poster) {
    verdict = MEDIA_READINESS_VERDICT.posterOnly;
    reason = source.reason;
  } else if (source.renderable) {
    verdict = MEDIA_READINESS_VERDICT.notReady;
    reason = posterReason;
  } else {
    reason = source.reason === MEDIA_READINESS_REASON.ok ? posterReason : source.reason;
  }

  return {
    slotId: slot.slotId,
    role: slot.role,
    label: slot.label,
    aspect: slot.aspect.label,
    verdict,
    reason,
    motionAllowed: verdict === MEDIA_READINESS_VERDICT.ready,
    playbackId: source.playbackId,
    sourceUrl: source.renderable ? source.publicPath : null,
    posterUrl: poster?.publicPath ?? null,
    posterFormat: poster?.format ?? null,
    disclosure: slot.disclosure ?? null,
    alt: slot.alt,
    viewport: slot.viewport ?? null,
    clipOrder: slot.clipOrder ?? null,
  };
}

export function evaluateMediaReadiness({ probe, slots = MEDIA_READINESS_SLOTS } = {}) {
  if (typeof probe !== 'function') throw new TypeError('evaluateMediaReadiness requires a probe function');

  const decisions = slots.map(slot => evaluateSlotReadiness(slot, probe));
  const landingHero = decisions.filter(decision => decision.role === 'landing-hero');
  const productVideo = decisions.filter(decision => decision.role === 'product-video');
  const renderable = decision => decision.verdict !== MEDIA_READINESS_VERDICT.notReady;

  return {
    schemaVersion: MEDIA_READINESS_SCHEMA,
    decisions,
    landingHero: {
      decisions: landingHero,
      renderable: landingHero.some(renderable),
      motionAllowed: landingHero.some(decision => decision.motionAllowed),
    },
    productVideo: {
      decisions: [...productVideo].sort((left, right) => (left.clipOrder ?? 0) - (right.clipOrder ?? 0)),
      renderable: productVideo.some(renderable),
      motionAllowed: productVideo.some(decision => decision.motionAllowed),
      readyClipCount: productVideo.filter(decision => decision.motionAllowed).length,
      declaredClipCount: productVideo.length,
    },
    blocking: decisions.filter(decision => decision.verdict === MEDIA_READINESS_VERDICT.notReady).map(decision => ({
      slotId: decision.slotId,
      role: decision.role,
      reason: decision.reason,
    })),
  };
}

export function heroPresentation(readiness, viewport = 'desktop') {
  const decision = readiness.landingHero.decisions.find(item => item.viewport === viewport)
    || readiness.landingHero.decisions[0]
    || null;
  if (!decision || decision.verdict === MEDIA_READINESS_VERDICT.notReady) return null;
  return decision;
}

export function readyProductClips(readiness) {
  return readiness.productVideo.decisions.filter(decision => decision.motionAllowed);
}
