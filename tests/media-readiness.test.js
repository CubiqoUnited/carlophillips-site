import { describe, expect, it } from 'vitest';
import {
  MEDIA_READINESS_REASON,
  MEDIA_READINESS_SLOTS,
  MEDIA_READINESS_VERDICT,
  evaluateMediaReadiness,
  heroPresentation,
  readyProductClips,
} from '../lib/media/media-readiness.js';
import { createFileProbe, getMediaReadiness } from '../lib/media/media-readiness-server.js';

const slotById = id => MEDIA_READINESS_SLOTS.find(slot => slot.slotId === id);
const decisionById = (readiness, id) => readiness.decisions.find(decision => decision.slotId === id);

function probeFrom(entries) {
  return relativePath => entries[relativePath] || { exists: false };
}

const runwaySlot = slotById('product-runway-motion');
const healthyEntries = {
  [runwaySlot.source.path]: { exists: true, bytes: 2_000_000, isoMedia: true },
  [runwaySlot.posters[0].path]: { exists: true, bytes: 15_000 },
};

describe('media readiness contract', () => {
  it('declares the landing hero and the three approved product clips', () => {
    expect(MEDIA_READINESS_SLOTS.filter(slot => slot.role === 'landing-hero').map(slot => slot.aspect.label))
      .toEqual(['16:9', '9:16']);
    expect(MEDIA_READINESS_SLOTS.filter(slot => slot.role === 'product-video').map(slot => slot.label))
      .toEqual(['Runway motion', 'Fit & silhouette', '360 showcase']);
    for (const slot of MEDIA_READINESS_SLOTS.filter(slot => slot.role === 'product-video')) {
      expect(slot.aspect.label).toBe('4:5');
    }
  });

  it('marks a slot ready only when an approved source and a first-frame poster are both evidenced', () => {
    const readiness = evaluateMediaReadiness({ probe: probeFrom(healthyEntries), slots: [runwaySlot] });
    const decision = decisionById(readiness, 'product-runway-motion');
    expect(decision.verdict).toBe(MEDIA_READINESS_VERDICT.ready);
    expect(decision.reason).toBe(MEDIA_READINESS_REASON.ok);
    expect(decision.motionAllowed).toBe(true);
    expect(decision.posterFormat).toBe('avif');
  });

  it('withholds motion but keeps the still when the source cannot be evidenced', () => {
    const readiness = evaluateMediaReadiness({
      probe: probeFrom({ [runwaySlot.posters[0].path]: { exists: true, bytes: 15_000 } }),
      slots: [runwaySlot],
    });
    const decision = decisionById(readiness, 'product-runway-motion');
    expect(decision.verdict).toBe(MEDIA_READINESS_VERDICT.posterOnly);
    expect(decision.reason).toBe(MEDIA_READINESS_REASON.sourceMissing);
    expect(decision.motionAllowed).toBe(false);
    expect(decision.sourceUrl).toBe(null);
    expect(decision.posterUrl).toBe(runwaySlot.posters[0].publicPath);
  });

  it('refuses a source that is present but not real ISO media, and one that is truncated', () => {
    const notMedia = evaluateMediaReadiness({
      probe: probeFrom({ ...healthyEntries, [runwaySlot.source.path]: { exists: true, bytes: 2_000_000, isoMedia: false } }),
      slots: [runwaySlot],
    });
    expect(decisionById(notMedia, 'product-runway-motion').reason).toBe(MEDIA_READINESS_REASON.sourceNotIsoMedia);

    const truncated = evaluateMediaReadiness({
      probe: probeFrom({ ...healthyEntries, [runwaySlot.source.path]: { exists: true, bytes: 12, isoMedia: true } }),
      slots: [runwaySlot],
    });
    expect(decisionById(truncated, 'product-runway-motion').reason).toBe(MEDIA_READINESS_REASON.sourceEmpty);
  });

  it('refuses a renderable source that has no reduced-motion poster', () => {
    const readiness = evaluateMediaReadiness({
      probe: probeFrom({ [runwaySlot.source.path]: healthyEntries[runwaySlot.source.path] }),
      slots: [runwaySlot],
    });
    const decision = decisionById(readiness, 'product-runway-motion');
    expect(decision.verdict).toBe(MEDIA_READINESS_VERDICT.notReady);
    expect(decision.reason).toBe(MEDIA_READINESS_REASON.posterMissing);
  });

  it('rejects a master whose observed aspect contradicts the declared composition', () => {
    const readiness = evaluateMediaReadiness({
      probe: probeFrom({ ...healthyEntries, [runwaySlot.source.path]: { exists: true, bytes: 2_000_000, isoMedia: true, width: 1920, height: 1080 } }),
      slots: [runwaySlot],
    });
    expect(decisionById(readiness, 'product-runway-motion').reason).toBe(MEDIA_READINESS_REASON.aspectMismatch);
  });

  it('fails closed for a declared slot with no provisioned master or poster', () => {
    const readiness = evaluateMediaReadiness({ probe: probeFrom({}), slots: [slotById('product-360-showcase')] });
    const decision = decisionById(readiness, 'product-360-showcase');
    expect(decision.verdict).toBe(MEDIA_READINESS_VERDICT.notReady);
    expect(decision.reason).toBe(MEDIA_READINESS_REASON.sourceNotDeclared);
    expect(readyProductClips(readiness)).toEqual([]);
    expect(readiness.blocking).toEqual([
      { slotId: 'product-360-showcase', role: 'product-video', reason: MEDIA_READINESS_REASON.sourceNotDeclared },
    ]);
  });

  it('prefers an adaptive playback identifier over a local master when one is provisioned', () => {
    const slot = { ...runwaySlot, source: { ...runwaySlot.source, playbackId: 'abc123' } };
    const readiness = evaluateMediaReadiness({
      probe: probeFrom({ [runwaySlot.posters[0].path]: { exists: true, bytes: 15_000 } }),
      slots: [slot],
    });
    const decision = decisionById(readiness, 'product-runway-motion');
    expect(decision.verdict).toBe(MEDIA_READINESS_VERDICT.ready);
    expect(decision.playbackId).toBe('abc123');
  });

  it('reports the repository state: two approved clips ready, the 360 slot withheld, hero poster-only', () => {
    const readiness = getMediaReadiness({ refresh: true });

    expect(readiness.productVideo.readyClipCount).toBe(2);
    expect(readiness.productVideo.declaredClipCount).toBe(3);
    expect(decisionById(readiness, 'product-runway-motion').verdict).toBe(MEDIA_READINESS_VERDICT.ready);
    expect(decisionById(readiness, 'product-fit-silhouette').verdict).toBe(MEDIA_READINESS_VERDICT.ready);
    expect(decisionById(readiness, 'product-360-showcase').verdict).toBe(MEDIA_READINESS_VERDICT.notReady);
    expect(readiness.landingHero.renderable).toBe(true);
    expect(heroPresentation(readiness, 'desktop').posterUrl).toMatch(/lofoten-runway-hero/);
    expect(readyProductClips(readiness).map(clip => clip.label)).toEqual(['Runway motion', 'Fit & silhouette']);
  });

  it('probes real files, sizes them, and detects the ISO media brand', () => {
    const probe = createFileProbe();
    const video = probe('public/media/signature-hoodie/videos/runway-motion-final.mp4');
    expect(video.exists).toBe(true);
    expect(video.isoMedia).toBe(true);
    expect(video.bytes).toBeGreaterThan(500_000);
    expect(probe('public/media/signature-hoodie/videos/does-not-exist.mp4')).toEqual({ exists: false });
    expect(probe(null)).toEqual({ exists: false });
  });
});
