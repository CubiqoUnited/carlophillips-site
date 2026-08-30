#!/usr/bin/env node
/*
 * Media readiness gate for the landing video hero and the default product video.
 *
 * Writes a machine-readable report and fails when a surface the storefront is expected to render
 * cannot be evidenced. Pass --strict to additionally fail when any declared slot is not fully ready
 * (used before a release, where an unprovisioned 360 master is a blocker rather than a known gap).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getMediaReadiness } from '../lib/media/media-readiness-server.js';
import { MEDIA_READINESS_VERDICT } from '../lib/media/media-readiness.js';

const strict = process.argv.includes('--strict');
const reportDirectory = path.resolve(process.cwd(), 'test_reports/media-readiness');
const reportPath = path.join(reportDirectory, 'media-readiness.json');

const readiness = getMediaReadiness({ refresh: true });

for (const decision of readiness.decisions) {
  const marker = decision.verdict === MEDIA_READINESS_VERDICT.ready
    ? 'READY      '
    : decision.verdict === MEDIA_READINESS_VERDICT.posterOnly
      ? 'POSTER-ONLY'
      : 'NOT-READY  ';
  console.log(`${marker} ${decision.slotId.padEnd(24)} ${decision.aspect.padEnd(5)} ${decision.reason}${decision.posterFormat ? ` · poster:${decision.posterFormat}` : ''}`);
}

console.log('');
console.log(`Landing hero:   renderable=${readiness.landingHero.renderable} motion=${readiness.landingHero.motionAllowed}`);
console.log(`Product video:  ${readiness.productVideo.readyClipCount}/${readiness.productVideo.declaredClipCount} approved clips ready`);

mkdirSync(reportDirectory, { recursive: true });
writeFileSync(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), strict, ...readiness }, null, 2)}\n`);
console.log(`Report: ${path.relative(process.cwd(), reportPath)}`);

const failures = [];
if (!readiness.landingHero.renderable) failures.push('landing hero has neither an approved master nor a first-frame poster');
if (!readiness.productVideo.renderable) failures.push('default product video has no renderable approved clip');
if (readiness.productVideo.readyClipCount === 0) failures.push('default product video has no clip cleared for motion');
if (strict) {
  for (const blocker of readiness.blocking) failures.push(`${blocker.slotId} is not ready (${blocker.reason})`);
}

if (failures.length) {
  console.error(`\nMedia readiness failed:\n${failures.map(failure => `  - ${failure}`).join('\n')}`);
  process.exit(1);
}

console.log('\nMedia readiness passed: every surface the storefront renders is evidenced.');
