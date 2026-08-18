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
      expect(candidate.sourceReference.startsWith('public/media/signature-hoodie/videos/')).toBe(true);
      expect(statSync(candidate.sourceReference).size).toBeGreaterThan(500_000);
      expect(readFileSync(candidate.sourceReference).subarray(4, 8).toString('ascii')).toBe('ftyp');
      expect(checksum(candidate.sourceReference)).toBe(candidate.checksum);
    }
  });

  it('keeps the landing video muted, finite, visibility-controlled and replayable', () => {
    const source = readFileSync('components/storefront/home-storefront.jsx', 'utf8');
    expect(source).toContain('muted');
    expect(source).toContain('playsInline');
    expect(source).toContain('onEnded={() => setMotionCompleted(true)}');
    expect(source).not.toMatch(/<video[\s\S]{0,280}\bloop\b/);
    expect(source).toContain('intersectionRatio >= 0.6');
    expect(source).toContain('document.hidden');
    expect(source).toContain('motionSuspended');
    expect(source).toContain('motionVideoRef.current.currentTime = 0');
  });

  it('opens the gallery on a factual still and exposes both videos by explicit selection', () => {
    const source = readFileSync('components/storefront/home-storefront.jsx', 'utf8');
    expect(source).toContain('setMediaIndex(0)');
    expect(source).toContain('Show ${media[index].label}');
    expect(source).toContain("label: 'Runway motion'");
    expect(source).toContain("label: 'Fit & silhouette'");
    expect(source).toContain('data-media-index={index}');
  });
});
