import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const baselineRoot = path.resolve(process.env.CP_QA_BASELINE_SCREENSHOT_DIR || '');
const candidateRoot = path.resolve(process.env.CP_QA_CANDIDATE_SCREENSHOT_DIR || '');
const reportPath = path.resolve(process.env.CP_QA_COMPARISON_REPORT || 'test_reports/public-screenshot-comparison.json');

if (!process.env.CP_QA_BASELINE_SCREENSHOT_DIR || !process.env.CP_QA_CANDIDATE_SCREENSHOT_DIR) {
  throw new Error('CP_QA_BASELINE_SCREENSHOT_DIR and CP_QA_CANDIDATE_SCREENSHOT_DIR are required.');
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

const baselineFiles = (await fs.readdir(baselineRoot))
  .filter(file => file.startsWith('public-') && file.endsWith('.png'))
  .sort();
const candidateFiles = (await fs.readdir(candidateRoot))
  .filter(file => file.startsWith('public-') && file.endsWith('.png'))
  .sort();

if (JSON.stringify(baselineFiles) !== JSON.stringify(candidateFiles) || baselineFiles.length === 0) {
  throw new Error('Public screenshot sets are empty or do not contain the same filenames.');
}

const comparisons = [];
for (const file of baselineFiles) {
  const baselineBuffer = await fs.readFile(path.join(baselineRoot, file));
  const candidateBuffer = await fs.readFile(path.join(candidateRoot, file));
  const baseline = await sharp(baselineBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const candidate = await sharp(candidateBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const dimensionsEqual = JSON.stringify(baseline.info) === JSON.stringify(candidate.info);
  let changedChannels = null;
  let changedPixels = null;

  if (dimensionsEqual) {
    changedChannels = 0;
    changedPixels = 0;
    for (let offset = 0; offset < baseline.data.length; offset += baseline.info.channels) {
      let pixelChanged = false;
      for (let channel = 0; channel < baseline.info.channels; channel += 1) {
        if (baseline.data[offset + channel] !== candidate.data[offset + channel]) {
          changedChannels += 1;
          pixelChanged = true;
        }
      }
      if (pixelChanged) changedPixels += 1;
    }
  }

  comparisons.push({
    file,
    dimensionsEqual,
    baselineSha256: sha256(baselineBuffer),
    candidateSha256: sha256(candidateBuffer),
    changedChannels,
    changedPixels,
    exact: dimensionsEqual && changedPixels === 0,
  });
}

const report = {
  schemaVersion: 'cp.public-screenshot-comparison.v1',
  comparedAt: new Date().toISOString(),
  baselineRoot,
  candidateRoot,
  fileCount: comparisons.length,
  passed: comparisons.every(comparison => comparison.exact),
  comparisons,
};

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ passed: report.passed, fileCount: report.fileCount, changedPixels: comparisons.reduce((total, comparison) => total + (comparison.changedPixels || 0), 0) }, null, 2));
if (!report.passed) process.exitCode = 1;
