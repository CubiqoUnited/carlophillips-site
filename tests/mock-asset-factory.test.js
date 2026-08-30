import { access, mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  collectJob,
  createDrop,
  runConfiguredAdapters,
} from '../tools/mock-asset-factory.mjs';

describe('mock asset factory', () => {
  it('creates an independent job and collects provider output into asset folders', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mock-asset-factory-'));
    const source = join(root, 'hoodie-mock.png');
    await writeFile(source, 'mock-source');

    const job = await createDrop({
      root,
      title: 'Black Hoodie',
      inputPaths: [source],
    });

    const request = JSON.parse(
      await readFile(join(job.jobDirectory, 'requests', 'merch.json'), 'utf8')
    );
    expect(request.provider).toBe('fashn');
    expect(request.outputDropFolder).toBe('incoming/merch');
    expect(job.manifest.boundaries.writesShopify).toBe(false);

    await mkdir(join(job.jobDirectory, 'incoming', 'merch'), {
      recursive: true,
    });
    await writeFile(
      join(job.jobDirectory, 'incoming', 'merch', 'front.png'),
      'generated'
    );
    const result = await collectJob(job.jobDirectory);

    expect(result).toEqual({
      jobId: job.jobId,
      collected: 1,
      state: 'generating_assets',
    });
    const manifest = JSON.parse(
      await readFile(join(job.jobDirectory, 'manifest.json'), 'utf8')
    );
    expect(manifest.readyAssets[0]).toMatchObject({
      stage: 'merch',
      file: 'assets/merch/front.png',
      label: 'candidate — human review required',
      bytes: 9,
    });
    expect(manifest.readyAssets[0].sha256).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(manifest.stages.merch.status).toBe('partial_output');
    expect(manifest.readyStageIds).toEqual([]);
  });

  it('dispatches configured adapters and assembles a complete review package', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mock-asset-factory-adapters-'));
    const source = join(root, 'hoodie-mock.png');
    await writeFile(source, 'mock-source');
    const job = await createDrop({
      root,
      title: 'Automated Hoodie',
      inputPaths: [source],
    });
    const calls = [];
    const fetchImpl = async (url, options) => {
      const request = JSON.parse(options.body);
      calls.push({ url, request });
      const plannedNames = {
        merch: [
          'merch-front-1.png',
          'merch-back-1.png',
          'merch-side-1.png',
          'merch-detail-1.png',
        ],
        'on-model': [
          'on-model-01.png',
          'on-model-02.png',
          'on-model-03.png',
          'on-model-04.png',
        ],
        '3d': ['approximate-product.glb', 'approximate-product-preview.png'],
        motion: ['runway-walk-1.mp4', 'product-showcase-1.mp4'],
        enhanced: [
          'enhanced-merch-front-1.png',
          'enhanced-merch-back-1.png',
          'enhanced-merch-side-1.png',
          'enhanced-merch-detail-1.png',
          'enhanced-on-model-01.png',
          'enhanced-on-model-02.png',
          'enhanced-on-model-03.png',
          'enhanced-on-model-04.png',
          'enhanced-approximate-product-preview.png',
        ],
      };
      return new Response(
        JSON.stringify({
          status: 'complete',
          assets: plannedNames[request.stage].map((fileName) => ({
            fileName,
            contentBase64: Buffer.from(`${request.stage}-asset`).toString(
              'base64'
            ),
          })),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };
    const endpoints = Object.fromEntries(
      ['merch', 'on-model', '3d', 'motion', 'enhanced'].map((stage) => [
        stage,
        `https://provider.example/${stage}`,
      ])
    );

    const result = await runConfiguredAdapters({
      jobDirectory: job.jobDirectory,
      endpoints,
      fetchImpl,
    });

    expect(result.state).toBe('review_package_ready');
    expect(calls.map((call) => call.request.stage)).toEqual([
      'merch',
      'on-model',
      '3d',
      'motion',
      'enhanced',
    ]);
    expect(calls.at(-1).request.inputs).toHaveLength(12);
    await expect(
      access(join(job.jobDirectory, 'assets', 'ready', 'package-manifest.json'))
    ).resolves.toBeUndefined();
    const manifest = JSON.parse(
      await readFile(join(job.jobDirectory, 'manifest.json'), 'utf8')
    );
    expect(manifest.boundaries).toMatchObject({
      publishesCommerce: false,
      createsPodProducts: false,
      writesShopify: false,
    });
    expect(manifest.readyStageIds).toEqual([
      'merch',
      'on-model',
      '3d',
      'motion',
      'enhanced',
    ]);
    expect(manifest.readyAssets.map((asset) => asset.file).sort()).toEqual(
      [
        'assets/merch/merch-front-1.png',
        'assets/merch/merch-back-1.png',
        'assets/merch/merch-side-1.png',
        'assets/merch/merch-detail-1.png',
        'assets/on-model/on-model-01.png',
        'assets/on-model/on-model-02.png',
        'assets/on-model/on-model-03.png',
        'assets/on-model/on-model-04.png',
        'assets/3d/approximate-product.glb',
        'assets/3d/approximate-product-preview.png',
        'assets/motion/runway-walk-1.mp4',
        'assets/motion/product-showcase-1.mp4',
        'assets/enhanced/enhanced-merch-front-1.png',
        'assets/enhanced/enhanced-merch-back-1.png',
        'assets/enhanced/enhanced-merch-side-1.png',
        'assets/enhanced/enhanced-merch-detail-1.png',
        'assets/enhanced/enhanced-on-model-01.png',
        'assets/enhanced/enhanced-on-model-02.png',
        'assets/enhanced/enhanced-on-model-03.png',
        'assets/enhanced/enhanced-on-model-04.png',
        'assets/enhanced/enhanced-approximate-product-preview.png',
      ].sort()
    );
    expect(manifest.stages['on-model'].provider).toBe('fashn-product-to-model');
    expect(manifest.stages['3d'].provider).toBe('tripo-v3');
  });

  it('persists an asynchronous provider job and resumes it by polling', async () => {
    const root = await mkdtemp(join(tmpdir(), 'mock-asset-factory-poll-'));
    const source = join(root, 'hoodie-mock.png');
    await writeFile(source, 'mock-source');
    const job = await createDrop({
      root,
      title: 'Polling Hoodie',
      inputPaths: [source],
    });
    let pollCount = 0;
    const fetchImpl = async (url, options) => {
      if (options?.method === 'POST') {
        return new Response(
          JSON.stringify({
            status: 'accepted',
            jobId: 'remote-123',
            statusUrl: 'https://provider.example/status/remote-123',
          }),
          { status: 202, headers: { 'Content-Type': 'application/json' } }
        );
      }
      pollCount += 1;
      return new Response(
        JSON.stringify({
          status: 'complete',
          assets: [
            {
              fileName: 'front.png',
              contentBase64: Buffer.from('front').toString('base64'),
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };
    const endpoints = { merch: 'https://provider.example/merch' };

    const dispatched = await runConfiguredAdapters({
      jobDirectory: job.jobDirectory,
      endpoints,
      fetchImpl,
    });
    expect(dispatched.manifest.stages.merch).toMatchObject({
      status: 'processing',
      externalJob: { jobId: 'remote-123' },
    });

    const resumed = await runConfiguredAdapters({
      jobDirectory: job.jobDirectory,
      endpoints,
      fetchImpl,
    });
    expect(pollCount).toBe(1);
    expect(resumed.manifest.stages.merch.status).toBe('partial_output');
    expect(resumed.manifest.stages.merch.assets[0].file).toBe(
      'assets/merch/front.png'
    );
  });
});
