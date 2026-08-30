import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import workspace from '../releases/cp-signature-hoodie-2026-001/media-generation-workspace.json';

function checksum(path) {
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
}

describe('approved Signature Hoodie Staging videos', () => {
  it('binds exact non-empty MP4 derivatives by checksum', () => {
    for (const candidate of workspace.candidates) {
      expect(
        candidate.sourceReference.startsWith(
          'public/media/signature-hoodie/videos/'
        )
      ).toBe(true);
      expect(statSync(candidate.sourceReference).size).toBeGreaterThan(500_000);
      expect(
        readFileSync(candidate.sourceReference).subarray(4, 8).toString('ascii')
      ).toBe('ftyp');
      expect(checksum(candidate.sourceReference)).toBe(candidate.checksum);
    }
  });

  /*
   * Workbook screen 03: muted autoplay runs Fit → Runway twice, then holds the Runway final frame
   * behind a centred Play. The stage must never loop, must stop when it leaves view or the tab is
   * hidden, and must stay replayable.
   */
  it('keeps the product stage muted, finite, visibility-controlled and replayable', () => {
    const source = readFileSync(
      'components/storefront/discovery-stage.jsx',
      'utf8'
    );
    expect(source).toContain('muted');
    expect(source).toContain('playsInline');
    expect(source).toContain('COMPLETE_SEQUENCES = 2');
    expect(source).toContain(
      'const nextClip = activeIndex >= 0 ? playableClips[activeIndex + 1] : null'
    );
    expect(source).toContain(
      'setActiveSlotId(playableClips[0]?.slotId || null)'
    );
    expect(source).toContain('onEnded={handleEnded}');
    expect(source).not.toMatch(/<video[\s\S]{0,400}\bloop\b/);
    expect(source).toContain('IntersectionObserver');
    expect(source).toContain('document.hidden');
    expect(source).toContain('suspended');
    expect(source).toContain('videoRef.current?.pause()');
  });

  it('drives the stage only from clips the readiness gate cleared for motion', () => {
    const source = readFileSync(
      'components/storefront/discovery-stage.jsx',
      'utf8'
    );
    expect(source).toContain(
      'declaredClips.filter(clip => clip.motionAllowed)'
    );
    expect(source).toContain('EXCEPTION_STATES.videoUnavailable');
    expect(source).toContain('setPlaybackFailed(true)');
    // A slot the gate withheld still shows its dash, disabled, rather than disappearing.
    expect(source).toContain('disabled={!clip.motionAllowed}');
  });

  it('keeps the gallery picture-only while the default stage exposes both videos', () => {
    const home = readFileSync(
      'components/storefront/home-storefront.jsx',
      'utf8'
    );
    const stage = readFileSync(
      'components/storefront/discovery-stage.jsx',
      'utf8'
    );
    const gallery = readFileSync(
      'components/storefront/gallery-overlay.jsx',
      'utf8'
    );
    expect(home).toContain(
      "setMediaIndex(typeof index === 'number' ? index : 0)"
    );
    expect(home).not.toContain("type: 'video'");
    expect(stage).toContain('declaredClips.map(clip =>');
    expect(stage).toContain('attemptPlay');
    expect(stage).toContain('onPlaying');
    expect(gallery).toContain('data-media-index={index}');
  });
});
