#!/usr/bin/env node

/**
 * Independent local asset factory.
 *
 * It deliberately has no CARLOPHILLIPS, Shopify, POD, or publishing imports.
 * A provider adapter consumes request JSON files and drops completed files into
 * a job's incoming/<stage>/ folder. This runner collects and catalogs them.
 */
import { createHash, randomUUID } from 'node:crypto';
import {
  access,
  copyFile,
  mkdir,
  readdir,
  readFile,
  rename,
  stat,
  writeFile,
} from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadDirectAdapters } from './mock-asset-factory-direct-adapters.mjs';
import { loadAssetFactoryEnvironment } from './mock-asset-factory-env.mjs';

const STAGES = Object.freeze([
  {
    id: 'merch',
    provider: 'fashn',
    request: 'Merch-only front, back, side, and detail candidate pack.',
    destination: 'assets/merch',
    expectedDeliverables: ['front', 'back', 'side', 'detail'],
    minimumAssets: 4,
  },
  {
    id: 'on-model',
    provider: 'fashn-product-to-model',
    request: 'Four on-model fit and styling candidates.',
    destination: 'assets/on-model',
    expectedDeliverables: [
      'candidate-01',
      'candidate-02',
      'candidate-03',
      'candidate-04',
    ],
    minimumAssets: 4,
  },
  {
    id: '3d',
    provider: 'tripo-v3',
    request: 'AI-assisted approximate 2.5D / GLB candidate.',
    destination: 'assets/3d',
    expectedDeliverables: [
      'approximate-product.glb',
      'optional-preview.png',
    ],
    minimumAssets: 1,
  },
  {
    id: 'motion',
    provider: 'runway',
    request: 'Silent runway walk and product showcase motion candidates.',
    destination: 'assets/motion',
    expectedDeliverables: ['runway-motion', 'product-showcase'],
    minimumAssets: 2,
  },
  {
    id: 'enhanced',
    provider: 'topaz-or-lets-enhance',
    request: 'Post-generation high-definition enhancement and artifact QA.',
    destination: 'assets/enhanced',
    expectedDeliverables: ['enhanced-images-and-video'],
    minimumAssets: 1,
  },
]);

const PRIMARY_STAGE_IDS = Object.freeze(['merch', 'on-model', '3d', 'motion']);

const ROOT_DEFAULT = resolve('mock-asset-factory-data');
const MANIFEST = 'manifest.json';
const MAX_ADAPTER_ASSET_BYTES = 100 * 1024 * 1024;
const ALLOWED_ASSET_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.mp4',
  '.webm',
  '.glb',
  '.gltf',
  '.usdz',
  '.json',
]);

function slug(value) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'drop'
  );
}

function now() {
  return new Date().toISOString();
}

function fingerprint(parts) {
  return `sha256:${createHash('sha256').update(parts.join('\n')).digest('hex')}`;
}

function safeAssetFileName(value) {
  const file = basename(value).replace(/[^a-zA-Z0-9._-]/g, '-');
  if (!file || file === '.' || file === '..') {
    throw new Error('Provider returned an invalid asset filename.');
  }
  if (
    !ALLOWED_ASSET_EXTENSIONS.has(
      file.slice(file.lastIndexOf('.')).toLowerCase()
    )
  ) {
    throw new Error(`Provider returned an unsupported asset type: ${file}`);
  }
  return file;
}

function configuredStageEndpoints(environment = process.env) {
  return {
    merch: environment.MOCK_ASSET_FACTORY_MERCH_URL,
    'on-model': environment.MOCK_ASSET_FACTORY_ON_MODEL_URL,
    '3d': environment.MOCK_ASSET_FACTORY_3D_URL,
    motion: environment.MOCK_ASSET_FACTORY_MOTION_URL,
    enhanced: environment.MOCK_ASSET_FACTORY_ENHANCER_URL,
  };
}

function assertHttpUrl(value, label) {
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${label} must use HTTP or HTTPS.`);
  }
  return parsed.toString();
}

async function ensureDirectory(path) {
  await mkdir(path, { recursive: true });
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function listFiles(directory) {
  const result = [];
  let entries = [];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await listFiles(path)));
    if (entry.isFile()) result.push(path);
  }
  return result;
}

async function fileEvidence(path) {
  const bytes = await readFile(path);
  return {
    sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
    bytes: bytes.byteLength,
  };
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readManifest(jobDirectory) {
  return JSON.parse(await readFile(join(jobDirectory, MANIFEST), 'utf8'));
}

async function writeManifest(jobDirectory, manifest) {
  await writeFile(
    join(jobDirectory, MANIFEST),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );
}

async function adapterInputFiles(jobDirectory, manifest, stageId) {
  const records =
    stageId === 'enhanced'
      ? manifest.readyAssets.filter((asset) => asset.stage !== 'enhanced')
      : manifest.inputs;
  return Promise.all(
    records.map(async (record) => {
      const relativePath = record.file;
      const bytes = await readFile(join(jobDirectory, relativePath));
      if (bytes.byteLength > MAX_ADAPTER_ASSET_BYTES) {
        throw new Error(`Adapter input is larger than 100 MB: ${relativePath}`);
      }
      return {
        fileName: basename(relativePath),
        relativePath,
        contentBase64: bytes.toString('base64'),
      };
    })
  );
}

async function saveAdapterAssets(jobDirectory, stageId, assets, fetchImpl) {
  if (!Array.isArray(assets) || assets.length === 0) {
    throw new Error('Completed provider response did not contain assets.');
  }
  const incoming = join(jobDirectory, 'incoming', stageId);
  await ensureDirectory(incoming);
  const saved = [];
  for (const [index, asset] of assets.entries()) {
    const fallback = `${stageId}-${String(index + 1).padStart(2, '0')}.bin`;
    const fileName = safeAssetFileName(
      asset.fileName || asset.name || fallback
    );
    let bytes;
    if (typeof asset.contentBase64 === 'string') {
      bytes = Buffer.from(asset.contentBase64, 'base64');
    } else if (typeof asset.url === 'string') {
      const response = await fetchImpl(assertHttpUrl(asset.url, 'Asset URL'));
      if (!response.ok) {
        throw new Error(`Asset download failed with HTTP ${response.status}.`);
      }
      bytes = Buffer.from(await response.arrayBuffer());
    } else {
      throw new Error(
        `Provider asset ${fileName} has no URL or base64 content.`
      );
    }
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_ADAPTER_ASSET_BYTES) {
      throw new Error(`Provider asset has an invalid size: ${fileName}`);
    }
    await writeFile(join(incoming, fileName), bytes);
    saved.push(fileName);
  }
  return saved;
}

async function applyAdapterResponse({
  jobDirectory,
  manifest,
  stageId,
  response,
  fetchImpl,
}) {
  const stage = manifest.stages[stageId];
  if (response.status === 'accepted' || response.status === 'processing') {
    if (!response.statusUrl && !response.providerState) {
      throw new Error('Asynchronous provider response requires statusUrl.');
    }
    stage.status = 'processing';
    stage.externalJob = {
      jobId: response.jobId || null,
      statusUrl: response.statusUrl
        ? assertHttpUrl(response.statusUrl, 'Provider status URL')
        : null,
      acceptedAt: now(),
      providerState: response.providerState || null,
    };
    return;
  }
  if (response.status === 'failed') {
    stage.status = 'failed';
    stage.error = response.error || 'Provider reported failure.';
    return;
  }
  if (response.status !== 'complete') {
    throw new Error(`Unsupported provider status: ${response.status}`);
  }
  await saveAdapterAssets(jobDirectory, stageId, response.assets, fetchImpl);
  stage.status = 'output_received';
  stage.externalJob = null;
  stage.error = null;
}

export async function runConfiguredAdapters({
  jobDirectory,
  endpoints = configuredStageEndpoints(),
  token = process.env.MOCK_ASSET_FACTORY_GATEWAY_TOKEN,
  fetchImpl = fetch,
  adapters = null,
}) {
  const resolvedAdapters =
    adapters || loadDirectAdapters(process.env, fetchImpl);
  let manifest = await readManifest(jobDirectory);
  for (const stageDefinition of STAGES) {
    const stageId = stageDefinition.id;
    const stage = manifest.stages[stageId];
    if (stage.assets.length > 0 || stage.status === 'failed') continue;
    if (stageId === 'enhanced' && !primaryMediaReady(manifest)) continue;
    const endpoint = endpoints[stageId];
    const directAdapter = resolvedAdapters[stageId];
    if (!endpoint && !directAdapter) {
      stage.status = 'waiting_for_adapter';
      continue;
    }
    try {
      stage.attempts += 1;
      let response;
      if (directAdapter) {
        const request = JSON.parse(
          await readFile(
            join(jobDirectory, 'requests', `${stageId}.json`),
            'utf8'
          )
        );
        response = await directAdapter({
          stageId,
          request,
          inputs: await adapterInputFiles(jobDirectory, manifest, stageId),
          externalJob: stage.status === 'processing' ? stage.externalJob : null,
        });
      } else if (
        stage.status === 'processing' &&
        stage.externalJob?.statusUrl
      ) {
        const statusResponse = await fetchImpl(stage.externalJob.statusUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!statusResponse.ok) {
          throw new Error(
            `Provider poll failed with HTTP ${statusResponse.status}.`
          );
        }
        response = await statusResponse.json();
      } else {
        const request = JSON.parse(
          await readFile(
            join(jobDirectory, 'requests', `${stageId}.json`),
            'utf8'
          )
        );
        const inputs = await adapterInputFiles(jobDirectory, manifest, stageId);
        const dispatchResponse = await fetchImpl(
          assertHttpUrl(endpoint, 'Provider endpoint'),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ ...request, inputs }),
          }
        );
        if (!dispatchResponse.ok) {
          throw new Error(
            `Provider dispatch failed with HTTP ${dispatchResponse.status}.`
          );
        }
        response = await dispatchResponse.json();
      }
      await applyAdapterResponse({
        jobDirectory,
        manifest,
        stageId,
        response,
        fetchImpl,
      });
    } catch (error) {
      stage.status = 'retryable_error';
      stage.error = error instanceof Error ? error.message : String(error);
    }
    manifest.updatedAt = now();
    await writeManifest(jobDirectory, manifest);
    await collectJob(jobDirectory);
    manifest = await readManifest(jobDirectory);
  }
  const collection = await collectJob(jobDirectory);
  return { ...collection, manifest: await readManifest(jobDirectory) };
}

export async function runAllConfiguredAdapters({
  root = ROOT_DEFAULT,
  endpoints,
  token,
  fetchImpl = fetch,
} = {}) {
  const jobsDirectory = join(resolve(root), 'jobs');
  let jobNames = [];
  try {
    jobNames = await readdir(jobsDirectory);
  } catch {
    return [];
  }
  const results = [];
  for (const name of jobNames) {
    results.push(
      await runConfiguredAdapters({
        jobDirectory: join(jobsDirectory, name),
        endpoints,
        token,
        fetchImpl,
      })
    );
  }
  return results;
}

function readyStageIds(manifest) {
  return STAGES.filter(
    (stage) => manifest.stages[stage.id].assets.length >= stage.minimumAssets
  ).map((stage) => stage.id);
}

function primaryMediaReady(manifest) {
  return PRIMARY_STAGE_IDS.every((stageId) => {
    const definition = STAGES.find((stage) => stage.id === stageId);
    return manifest.stages[stageId].assets.length >= definition.minimumAssets;
  });
}

function completePackageReady(manifest) {
  const enhanced = STAGES.find((stage) => stage.id === 'enhanced');
  return (
    primaryMediaReady(manifest) &&
    manifest.stages.enhanced.assets.length >= enhanced.minimumAssets
  );
}

async function assembleReviewPackage(jobDirectory, manifest) {
  if (!completePackageReady(manifest)) return false;
  const readyDirectory = join(jobDirectory, 'assets', 'ready');
  await ensureDirectory(readyDirectory);
  if (await pathExists(join(readyDirectory, 'package-manifest.json')))
    return true;
  const packagedAssets = [];
  for (const record of manifest.readyAssets) {
    const source = join(jobDirectory, record.file);
    const stageDirectory = join(readyDirectory, record.stage);
    const target = join(stageDirectory, basename(record.file));
    await ensureDirectory(stageDirectory);
    if (!(await pathExists(target))) await copyFile(source, target);
    packagedAssets.push({
      ...record,
      packagedFile: `assets/ready/${record.stage}/${basename(record.file)}`,
    });
  }
  const packageManifest = {
    schemaVersion: 'mock-asset-review-package.v1',
    jobId: manifest.jobId,
    title: manifest.title,
    assembledAt: now(),
    status: 'review_required',
    truthStatus: 'candidate-only',
    assets: packagedAssets,
  };
  await writeFile(
    join(readyDirectory, 'package-manifest.json'),
    `${JSON.stringify(packageManifest, null, 2)}\n`,
    'utf8'
  );
  await writeFile(
    join(readyDirectory, 'README.md'),
    `# ${manifest.title} — review-ready media package\n\nThese files are generated candidates. Human review is required before product or campaign use. 3D/360 assets remain AI-assisted/approximate unless physically verified.\n`,
    'utf8'
  );
  return true;
}

export async function createDrop({ root = ROOT_DEFAULT, title, inputPaths }) {
  if (!title)
    throw new Error('A title is required. Use --title "Black Hoodie".');
  if (!inputPaths?.length)
    throw new Error('Drop at least one mock or reference image.');

  const sources = inputPaths.map((path) => resolve(path));
  for (const source of sources) {
    if (!(await isFile(source)))
      throw new Error(`Input file not found: ${source}`);
  }

  const sourceEvidence = await Promise.all(
    sources.map(async (source) => {
      const bytes = await readFile(source);
      return {
        source,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      };
    })
  );
  const inputFingerprint = fingerprint([
    title,
    ...sourceEvidence.map(
      (evidence) => `${basename(evidence.source)}:${evidence.sha256}`
    ),
  ]);
  const jobId = `${slug(title)}-${now().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
  const jobDirectory = join(resolve(root), 'jobs', jobId);
  await ensureDirectory(join(jobDirectory, 'source'));
  await ensureDirectory(join(jobDirectory, 'incoming'));
  await ensureDirectory(join(jobDirectory, 'requests'));
  await ensureDirectory(join(jobDirectory, 'assets', 'ready'));

  const inputs = [];
  for (const [index, source] of sources.entries()) {
    const fileName = `${String(index + 1).padStart(2, '0')}-${basename(source)}`;
    const target = join(jobDirectory, 'source', fileName);
    await copyFile(source, target);
    inputs.push({
      originalPath: source,
      file: `source/${fileName}`,
      sha256: sourceEvidence[index].sha256,
    });
  }

  const manifest = {
    schemaVersion: 'mock-asset-factory.v1',
    jobId,
    title,
    createdAt: now(),
    updatedAt: now(),
    state: 'awaiting_provider_outputs',
    inputFingerprint,
    inputs,
    stages: Object.fromEntries(
      STAGES.map((stage) => [
        stage.id,
        {
          provider: stage.provider,
          status:
            stage.id === 'enhanced' ? 'waiting_for_primary_media' : 'requested',
          expectedDeliverables: stage.expectedDeliverables,
          minimumAssets: stage.minimumAssets,
          assets: [],
          externalJob: null,
          attempts: 0,
          error: null,
        },
      ])
    ),
    readyAssets: [],
    boundaries: {
      publishesCommerce: false,
      createsPodProducts: false,
      writesShopify: false,
      requiresHumanReviewBeforeUse: true,
    },
  };

  for (const stage of STAGES) {
    const request = {
      schemaVersion: 'mock-asset-factory-provider-request.v1',
      jobId,
      title,
      stage: stage.id,
      provider: stage.provider,
      instruction: stage.request,
      inputFiles: inputs.map((input) => input.file),
      outputDropFolder: `incoming/${stage.id}`,
      requiredLabels:
        stage.id === '3d'
          ? [
              'AI-assisted 360 / approximate 2.5D GLB unless physically verified',
            ]
          : [],
      expectedDeliverables: stage.expectedDeliverables,
      minimumAssets: stage.minimumAssets,
    };
    await ensureDirectory(join(jobDirectory, 'incoming', stage.id));
    await ensureDirectory(join(jobDirectory, stage.destination));
    await writeFile(
      join(jobDirectory, 'requests', `${stage.id}.json`),
      `${JSON.stringify(request, null, 2)}\n`,
      'utf8'
    );
  }

  await writeManifest(jobDirectory, manifest);
  return { jobId, jobDirectory, manifest };
}

export async function collectJob(jobDirectory) {
  const manifest = await readManifest(jobDirectory);
  let collected = 0;
  for (const stage of STAGES) {
    const incoming = join(jobDirectory, 'incoming', stage.id);
    const destination = join(jobDirectory, stage.destination);
    await ensureDirectory(destination);
    for (const source of await listFiles(incoming)) {
      const file = basename(source);
      let target = join(destination, file);
      if (await isFile(target)) {
        const [incomingEvidence, existingEvidence] = await Promise.all([
          fileEvidence(source),
          fileEvidence(target),
        ]);
        if (incomingEvidence.sha256 === existingEvidence.sha256) {
          const duplicateDirectory = join(jobDirectory, 'duplicates', stage.id);
          await ensureDirectory(duplicateDirectory);
          await rename(
            source,
            join(duplicateDirectory, `${Date.now()}-${file}`)
          );
          continue;
        }
        const extension = extname(file);
        const stem = file.slice(0, -extension.length);
        target = join(
          destination,
          `${stem}-${incomingEvidence.sha256.slice(7, 15)}${extension}`
        );
      }
      await rename(source, target);
      const evidence = await fileEvidence(target);
      const record = {
        stage: stage.id,
        provider: manifest.stages[stage.id].provider,
        file: `${stage.destination}/${basename(target)}`,
        ...evidence,
        collectedAt: now(),
        label:
          stage.id === '3d'
            ? 'AI-assisted / approximate until physically verified'
            : 'candidate — human review required',
      };
      manifest.stages[stage.id].assets.push(record);
      manifest.readyAssets.push(record);
      manifest.stages[stage.id].status =
        manifest.stages[stage.id].assets.length >= stage.minimumAssets
          ? 'ready_for_review'
          : 'partial_output';
      collected += 1;
    }
  }
  if (
    primaryMediaReady(manifest) &&
    manifest.stages.enhanced.status === 'waiting_for_primary_media'
  ) {
    manifest.stages.enhanced.status = 'requested';
  }
  manifest.updatedAt = now();
  const packageReady = await assembleReviewPackage(jobDirectory, manifest);
  manifest.state = packageReady
    ? 'review_package_ready'
    : manifest.readyAssets.length
      ? 'generating_assets'
      : 'awaiting_provider_outputs';
  manifest.readyStageIds = readyStageIds(manifest);
  await writeManifest(jobDirectory, manifest);
  return { jobId: manifest.jobId, collected, state: manifest.state };
}

export async function collectAll(root = ROOT_DEFAULT) {
  const jobsDirectory = join(resolve(root), 'jobs');
  let jobNames = [];
  try {
    jobNames = await readdir(jobsDirectory);
  } catch {
    return [];
  }
  return Promise.all(
    jobNames.map((name) => collectJob(join(jobsDirectory, name)))
  );
}

export async function listJobs(root = ROOT_DEFAULT) {
  const jobsDirectory = join(resolve(root), 'jobs');
  let jobNames = [];
  try {
    jobNames = await readdir(jobsDirectory);
  } catch {
    return [];
  }
  const jobs = [];
  for (const name of jobNames) {
    try {
      jobs.push(await readManifest(join(jobsDirectory, name)));
    } catch {
      // Ignore incomplete directories that do not contain a valid manifest.
    }
  }
  return jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function watch(root = ROOT_DEFAULT, intervalMs = 2000) {
  process.stdout.write(
    `Watching ${resolve(root)}/jobs for provider outputs…\n`
  );
  const tick = async () => {
    const results = await runAllConfiguredAdapters({ root });
    for (const result of results.filter((item) => item.collected)) {
      process.stdout.write(
        `${result.jobId}: collected ${result.collected}; ${result.state}\n`
      );
    }
  };
  await tick();
  return setInterval(
    () => tick().catch((error) => console.error(error)),
    intervalMs
  );
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const values = { command, inputPaths: [] };
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === '--root') values.root = rest[++index];
    else if (token === '--title') values.title = rest[++index];
    else if (token === '--interval') values.intervalMs = Number(rest[++index]);
    else if (token === '--env') values.env = rest[++index];
    else values.inputPaths.push(token);
  }
  return values;
}

export async function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  loadAssetFactoryEnvironment(args.env);
  if (args.command === 'drop') {
    const result = await createDrop(args);
    process.stdout.write(
      `Created ${result.jobId}\nSource: ${result.jobDirectory}/source\nProvider requests: ${result.jobDirectory}/requests\nReady assets: ${result.jobDirectory}/assets/ready\n`
    );
    return result;
  }
  if (args.command === 'collect') {
    const results = await collectAll(args.root);
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    return results;
  }
  if (args.command === 'run') {
    const results = await runAllConfiguredAdapters({ root: args.root });
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    return results;
  }
  if (args.command === 'watch') return watch(args.root, args.intervalMs);
  throw new Error(
    'Usage: mock-asset-factory <drop|run|collect|watch> [--root path] [--env path] [--title title] [--interval ms] [mock files…]'
  );
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
