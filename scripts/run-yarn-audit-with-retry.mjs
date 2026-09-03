import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const attempts = 3;
const retryDelaysMs = [5_000, 15_000];
let lastStatus = 1;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const result = spawnSync(
    'yarn',
    [
      'audit',
      '--groups',
      'dependencies',
      '--level',
      'moderate',
      '--network-timeout',
      '60000',
    ],
    { stdio: 'inherit' }
  );

  lastStatus = result.status ?? 1;
  if (lastStatus === 0) break;

  if (attempt < attempts) {
    const waitMs = retryDelaysMs[attempt - 1];
    console.error(
      `Production dependency audit attempt ${attempt}/${attempts} failed; retrying in ${waitMs / 1_000}s.`
    );
    await delay(waitMs);
  }
}

if (lastStatus !== 0) {
  console.error(
    `Production dependency audit failed after ${attempts} attempts; verification remains blocked.`
  );
  process.exitCode = lastStatus;
}
