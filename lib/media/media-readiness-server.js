import { openSync, readSync, closeSync, statSync } from 'node:fs';
import path from 'node:path';
import { evaluateMediaReadiness } from './media-readiness.js';

/*
 * Filesystem probe for the media readiness contract. It answers three questions and nothing more:
 * does the declared file exist, how large is it, and — for a video master — is it a real ISO base
 * media file (an `ftyp` box at offset 4)? Everything else is decided by the pure contract.
 */
const ISO_MEDIA_BRAND = 'ftyp';
const VIDEO_EXTENSIONS = new Set(['.mp4', '.m4v', '.mov']);

function readIsoBrand(absolutePath) {
  let descriptor = null;
  try {
    descriptor = openSync(absolutePath, 'r');
    const header = Buffer.alloc(12);
    readSync(descriptor, header, 0, header.length, 0);
    return header.subarray(4, 8).toString('ascii');
  } catch {
    return null;
  } finally {
    if (descriptor !== null) closeSync(descriptor);
  }
}

export function createFileProbe(rootDirectory = process.cwd()) {
  return relativePath => {
    if (!relativePath) return { exists: false };
    const absolutePath = path.resolve(rootDirectory, relativePath);
    let stats = null;
    try {
      stats = statSync(absolutePath);
    } catch {
      return { exists: false };
    }
    if (!stats.isFile()) return { exists: false };

    const observation = { exists: true, bytes: stats.size };
    if (VIDEO_EXTENSIONS.has(path.extname(absolutePath).toLowerCase())) {
      observation.isoMedia = readIsoBrand(absolutePath) === ISO_MEDIA_BRAND;
    }
    return observation;
  };
}

let cachedReadiness = null;

export function getMediaReadiness({ rootDirectory = process.cwd(), refresh = false } = {}) {
  if (!refresh && cachedReadiness) return cachedReadiness;
  cachedReadiness = evaluateMediaReadiness({ probe: createFileProbe(rootDirectory) });
  return cachedReadiness;
}
