import { readFileSync, writeFileSync } from 'node:fs';
import {
  createProtectedReleaseReceipt,
  verifyProtectedReleaseReceipt,
} from '../../lib/releases/protected-release-gate.js';

function argumentsFor(values) {
  const [mode, ...rest] = values;
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index];
    const value = rest[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`INVALID_ARGUMENT_${key || 'MISSING'}`);
    }
    options[key.slice(2)] = value;
  }
  return { mode, options };
}

function json(path) {
  if (!path) throw new Error('RECEIPT_INPUT_REQUIRED');
  return JSON.parse(readFileSync(path, 'utf8'));
}

const { mode, options } = argumentsFor(process.argv.slice(2));
const secret = process.env.CP_RELEASE_RECEIPT_SIGNING_SECRET || '';

if (mode === 'sign') {
  if (!options.input || !options.output) throw new Error('SIGN_PATHS_REQUIRED');
  const receipt = createProtectedReleaseReceipt(json(options.input), secret);
  writeFileSync(options.output, `${JSON.stringify(receipt, null, 2)}\n`);
  process.stdout.write(
    'Protected Staging receipt signed without emitting its secret.\n'
  );
} else if (mode === 'verify') {
  const sourcePullRequest = Number(options['source-pull-request']);
  verifyProtectedReleaseReceipt(
    json(options.input),
    {
      gitCommitSha: options['expected-sha'],
      release: options['expected-release'],
      sourcePullRequest,
    },
    secret
  );
  process.stdout.write(
    'Protected Staging receipt signature and release gates verified.\n'
  );
} else {
  throw new Error(`RECEIPT_MODE_INVALID_${mode || 'MISSING'}`);
}
