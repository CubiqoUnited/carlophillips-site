import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  createAssetFactoryServer,
  startAssetFactoryServer,
} from '../tools/mock-asset-factory-server.mjs';

const servers = [];

afterEach(() => {
  for (const server of servers.splice(0)) {
    server.closeAllConnections();
    server.close();
  }
});

describe('mock asset factory server', () => {
  it('supports a no-automation inspection mode', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mock-asset-factory-safe-'));
    const server = await startAssetFactoryServer({
      root,
      port: 0,
      automationIntervalMs: 0,
    });
    servers.push(server);
    expect(server.listening).toBe(true);
  });

  it('serves the drop interface and creates a durable job from an uploaded mock', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mock-asset-factory-server-'));
    const server = createAssetFactoryServer({ root });
    servers.push(server);
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    const origin = `http://127.0.0.1:${address.port}`;

    const page = await fetch(origin);
    expect(page.status).toBe(200);
    const pageHtml = await page.text();
    expect(pageHtml).toContain('Drop a mock.');
    expect(pageHtml).toContain('Claid 2× image enhance');

    const health = await fetch(`${origin}/api/health`).then((response) =>
      response.json()
    );
    expect(health).toMatchObject({ status: 'ok', independent: true });
    expect(health.configuredStages).toBeInstanceOf(Array);
    expect(health.missingStages).toBeInstanceOf(Array);
    expect(health.configuredStages.length + health.missingStages.length).toBe(
      5
    );

    const created = await fetch(`${origin}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Uploaded Hoodie',
        files: [
          {
            name: 'hoodie.png',
            contentBase64: Buffer.from('image-bytes').toString('base64'),
          },
        ],
      }),
    });
    expect(created.status).toBe(201);
    const manifest = await created.json();
    expect(manifest.title).toBe('Uploaded Hoodie');
    expect(manifest.boundaries.writesShopify).toBe(false);
    expect(manifest.readyStageIds).toEqual([]);

    const jobs = await fetch(`${origin}/api/jobs`).then((response) =>
      response.json()
    );
    expect(jobs).toHaveLength(1);
    expect(jobs[0].jobId).toBe(manifest.jobId);
  });
});
