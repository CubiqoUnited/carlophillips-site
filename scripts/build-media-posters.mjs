#!/usr/bin/env node
/*
 * Derives the optimised AVIF/WebP first-frame posters the workbook requires from the existing
 * approved poster stills. This re-encodes an approved frame; it never synthesises new imagery.
 * Run after a poster still changes, then re-run `yarn verify:media-readiness`.
 */
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const derivations = [
  'public/media/signature-hoodie/posters/runway-motion-final.jpg',
  'public/media/signature-hoodie/posters/fit-silhouette-final.jpg',
  'public/campaigns/lofoten-runway-hero.png',
];

for (const relativeSource of derivations) {
  const source = path.resolve(process.cwd(), relativeSource);
  if (!existsSync(source)) {
    console.error(`Missing approved poster still: ${relativeSource}`);
    process.exit(1);
  }
  const withoutExtension = source.slice(0, -path.extname(source).length);
  const metadata = await sharp(source).metadata();

  await sharp(source).avif({ quality: 55, effort: 6 }).toFile(`${withoutExtension}.avif`);
  await sharp(source).webp({ quality: 78, effort: 6 }).toFile(`${withoutExtension}.webp`);

  const report = format => `${format}:${(statSync(`${withoutExtension}.${format}`).size / 1024).toFixed(0)}kB`;
  console.log(`${relativeSource} ${metadata.width}x${metadata.height} -> ${report('avif')} ${report('webp')}`);
}

console.log('Optimised first-frame posters written.');
