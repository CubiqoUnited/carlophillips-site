import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const auditLevels = new Set(['medium', 'moderate', 'high', 'critical']);
const attempts = 3;

function readManifest(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function findInstalledManifest(startDirectory, packageName) {
  let directory = resolve(startDirectory);
  while (true) {
    const candidate = join(
      directory,
      'node_modules',
      ...packageName.split('/'),
      'package.json'
    );
    if (existsSync(candidate)) return realpathSync(candidate);
    const parent = dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

function workspaceManifestPaths(rootDirectory, workspacePatterns) {
  const paths = [];
  for (const pattern of workspacePatterns) {
    if (!pattern.endsWith('/*')) {
      throw new Error(`Unsupported workspace pattern: ${pattern}`);
    }
    const parent = join(rootDirectory, pattern.slice(0, -2));
    for (const entry of readdirSync(parent)) {
      const packageDirectory = join(parent, entry);
      const manifest = join(packageDirectory, 'package.json');
      if (statSync(packageDirectory).isDirectory() && existsSync(manifest)) {
        paths.push(manifest);
      }
    }
  }
  return paths;
}

function installedProductionVersions() {
  const rootDirectory = process.cwd();
  const rootManifestPath = join(rootDirectory, 'package.json');
  const rootManifest = readManifest(rootManifestPath);
  if (!rootManifest.packageManager?.startsWith('yarn@1.22.22')) {
    throw new Error(
      'Production dependency audit requires Yarn Classic 1.22.22.'
    );
  }
  if (!existsSync(join(rootDirectory, 'yarn.lock'))) {
    throw new Error('Production dependency audit requires yarn.lock.');
  }

  const pending = [
    rootManifestPath,
    ...workspaceManifestPaths(rootDirectory, rootManifest.workspaces ?? []),
  ];
  const visited = new Set();
  const packages = new Set();

  while (pending.length > 0) {
    const manifestPath = realpathSync(pending.pop());
    if (visited.has(manifestPath)) continue;
    visited.add(manifestPath);

    const manifest = readManifest(manifestPath);
    if (
      manifest.name &&
      manifest.version &&
      !manifest.name.startsWith('@repo/')
    ) {
      packages.add(`${manifest.name}@${manifest.version}`);
    }

    const required = Object.keys(manifest.dependencies ?? {});
    const optional = new Set(Object.keys(manifest.optionalDependencies ?? {}));
    for (const packageName of [...required, ...optional]) {
      const dependencyManifest = findInstalledManifest(
        dirname(manifestPath),
        packageName
      );
      if (!dependencyManifest && optional.has(packageName)) continue;
      if (!dependencyManifest) {
        throw new Error(
          `Installed production dependency is missing: ${manifest.name} -> ${packageName}`
        );
      }
      pending.push(dependencyManifest);
    }
  }

  if (packages.size === 0) {
    throw new Error('No installed production dependency versions were found.');
  }
  return [...packages].sort();
}

function nextPage(linkHeader) {
  if (!linkHeader) return null;
  const next = linkHeader
    .split(',')
    .find((entry) => entry.includes('rel="next"'));
  return next?.match(/<([^>]+)>/u)?.[1] ?? null;
}

async function fetchReviewedAdvisories(packages) {
  const url = new URL('https://api.github.com/advisories');
  url.searchParams.set('type', 'reviewed');
  url.searchParams.set('ecosystem', 'npm');
  url.searchParams.set('affects', packages.join(','));
  url.searchParams.set('per_page', '100');

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CARLOPHILLIPS-production-dependency-audit',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const advisories = [];
  let pageUrl = url.href;
  while (pageUrl) {
    let response;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        response = await fetch(pageUrl, {
          headers,
          signal: AbortSignal.timeout(60_000),
        });
        if (response.ok) break;
        throw new Error(
          `GitHub Advisory Database returned HTTP ${response.status}.`
        );
      } catch (error) {
        if (attempt === attempts) throw error;
        await delay(attempt * 5_000);
      }
    }

    advisories.push(...(await response.json()));
    pageUrl = nextPage(response.headers.get('link'));
  }
  return advisories;
}

try {
  const packages = installedProductionVersions();
  const advisories = await fetchReviewedAdvisories(packages);
  const blocking = advisories.filter(
    (advisory) =>
      !advisory.withdrawn_at &&
      auditLevels.has(advisory.severity?.toLowerCase())
  );

  if (blocking.length > 0) {
    for (const advisory of blocking) {
      console.error(
        `${advisory.severity}: ${advisory.ghsa_id} ${advisory.html_url}`
      );
    }
    throw new Error(
      `${blocking.length} reviewed moderate-or-higher production dependency advisory record(s) found.`
    );
  }

  console.log(
    `Production dependency audit passed: ${packages.length} exact Yarn-locked versions, no reviewed moderate-or-higher advisories.`
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
