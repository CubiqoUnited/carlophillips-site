import { describe, expect, it, vi } from 'vitest';

import {
  DIRECT_ADAPTER_PROMPTS,
  loadDirectAdapters,
} from '../tools/mock-asset-factory-direct-adapters.mjs';

const input = {
  fileName: 'mock.png',
  relativePath: 'source/mock.png',
  contentBase64: Buffer.from('mock').toString('base64'),
};

describe('direct media adapters', () => {
  it('creates four candidate-only FASHN merchandise views', async () => {
    let dispatchIndex = 0;
    const fetchImpl = vi.fn(async (url, options) => {
      if (url.endsWith('/v1/run')) {
        dispatchIndex += 1;
        const body = JSON.parse(options.body);
        expect(body.model_name).toBe('edit');
        return new Response(JSON.stringify({ id: `edit-${dispatchIndex}` }), {
          status: 200,
        });
      }
      const taskId = url.split('/').at(-1);
      return new Response(
        JSON.stringify({
          id: taskId,
          status: 'completed',
          output: [`https://cdn.fashn.ai/${taskId}.png`],
        }),
        { status: 200 }
      );
    });
    const adapter = loadDirectAdapters(
      { FASHN_API_KEY: 'secret' },
      fetchImpl
    ).merch;
    const accepted = await adapter({ inputs: [input], externalJob: null });
    expect(accepted.providerState.taskIds).toHaveLength(4);
    const complete = await adapter({
      inputs: [input],
      externalJob: {
        jobId: accepted.jobId,
        providerState: accepted.providerState,
      },
    });
    expect(complete.assets.map((asset) => asset.fileName)).toEqual([
      'merch-front-1.png',
      'merch-back-1.png',
      'merch-side-1.png',
      'merch-detail-1.png',
    ]);
    expect(DIRECT_ADAPTER_PROMPTS.merchViews).toHaveLength(4);
  });

  it('maps FASHN product-to-model submit and polling to the common adapter contract', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'prediction-1', error: null }), {
          status: 200,
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'prediction-1',
            status: 'completed',
            output: ['https://cdn.fashn.ai/output.png'],
            error: null,
          }),
          { status: 200 }
        )
      );
    const adapter = loadDirectAdapters({ FASHN_API_KEY: 'secret' }, fetchImpl)[
      'on-model'
    ];
    const accepted = await adapter({ inputs: [input], externalJob: null });
    expect(accepted).toMatchObject({
      status: 'accepted',
      jobId: 'prediction-1',
    });
    const dispatchBody = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(dispatchBody).toMatchObject({
      model_name: 'product-to-model',
      inputs: { num_images: 4, resolution: '2k' },
    });
    expect(dispatchBody.inputs.product_image).toMatch(
      /^data:image\/png;base64,/
    );

    const complete = await adapter({
      inputs: [input],
      externalJob: { jobId: 'prediction-1', providerState: null },
    });
    expect(complete).toEqual({
      status: 'complete',
      assets: [
        {
          fileName: 'on-model-01.png',
          url: 'https://cdn.fashn.ai/output.png',
        },
      ],
    });
  });

  it('requests a textured GLB from Meshy and preserves the approximate-media boundary', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ result: 'meshy-task' }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'meshy-task',
            status: 'SUCCEEDED',
            model_urls: { glb: 'https://assets.meshy.ai/model.glb' },
          }),
          { status: 200 }
        )
      );
    const adapter = loadDirectAdapters({ MESHY_API_KEY: 'secret' }, fetchImpl)[
      '3d'
    ];
    const accepted = await adapter({ inputs: [input], externalJob: null });
    expect(accepted.jobId).toBe('meshy-task');
    const request = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(request).toMatchObject({
      enable_pbr: true,
      should_texture: true,
      target_formats: ['glb'],
    });
    const complete = await adapter({
      inputs: [input],
      externalJob: accepted.providerState
        ? { jobId: accepted.jobId, providerState: accepted.providerState }
        : null,
    });
    expect(complete.assets).toEqual([
      {
        fileName: 'approximate-product.glb',
        url: 'https://assets.meshy.ai/model.glb',
      },
    ]);
  });

  it('uploads one mock to Tripo v3 and returns a truth-labelled approximate GLB', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 0,
            data: {
              presigned_url: 'https://uploads.tripo.test/input',
              file_token: 'file-1',
            },
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ code: 0, data: { task_id: 'tripo-task' } }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: 0,
            data: {
              task_id: 'tripo-task',
              status: 'success',
              output: {
                model_url: 'https://assets.tripo.test/model.glb',
                rendered_image_url: 'https://assets.tripo.test/preview.png',
              },
            },
          }),
          { status: 200 }
        )
      );
    const adapter = loadDirectAdapters({ TRIPO_API_KEY: 'secret' }, fetchImpl)[
      '3d'
    ];
    const accepted = await adapter({ inputs: [input], externalJob: null });
    expect(accepted).toMatchObject({ status: 'accepted', jobId: 'tripo-task' });
    expect(fetchImpl.mock.calls[1][0]).toBe('https://uploads.tripo.test/input');
    expect(fetchImpl.mock.calls[1][1]).toMatchObject({ method: 'PUT' });
    const request = JSON.parse(fetchImpl.mock.calls[2][1].body);
    expect(request).toMatchObject({
      input: 'file-1',
      texture: true,
      pbr: true,
      texture_quality: 'standard',
    });
    const complete = await adapter({
      inputs: [input],
      externalJob: {
        jobId: accepted.jobId,
        providerState: accepted.providerState,
      },
    });
    expect(complete.assets).toEqual([
      {
        fileName: 'approximate-product.glb',
        url: 'https://assets.tripo.test/model.glb',
      },
      {
        fileName: 'approximate-product-preview.png',
        url: 'https://assets.tripo.test/preview.png',
      },
    ]);
  });

  it('submits and polls the two required Runway motion clips', async () => {
    const fetchImpl = vi.fn(async (url, options) => {
      if (url.endsWith('/image_to_video')) {
        const body = JSON.parse(options.body);
        const id = body.duration === 10 ? 'walk-task' : 'showcase-task';
        return new Response(JSON.stringify({ id }), { status: 200 });
      }
      const id = url.endsWith('walk-task') ? 'walk-task' : 'showcase-task';
      return new Response(
        JSON.stringify({
          id,
          status: 'SUCCEEDED',
          output: [`https://runway.example/${id}.mp4`],
        }),
        { status: 200 }
      );
    });
    const adapter = loadDirectAdapters(
      { RUNWAYML_API_SECRET: 'secret' },
      fetchImpl
    ).motion;
    const accepted = await adapter({ inputs: [input], externalJob: null });
    expect(accepted.providerState.taskIds).toEqual([
      'walk-task',
      'showcase-task',
    ]);
    expect(DIRECT_ADAPTER_PROMPTS.runwayWalk.length).toBeLessThanOrEqual(1000);
    expect(DIRECT_ADAPTER_PROMPTS.productShowcase.length).toBeLessThanOrEqual(
      1000
    );
    const complete = await adapter({
      inputs: [input],
      externalJob: {
        jobId: accepted.jobId,
        providerState: accepted.providerState,
      },
    });
    expect(complete.assets.map((asset) => asset.fileName)).toEqual([
      'runway-walk-1.mp4',
      'product-showcase-1.mp4',
    ]);
  });

  it('enhances only raster images through the official Claid upload endpoint', async () => {
    const fetchImpl = vi.fn(async (_url, options) => {
      expect(options.headers).toEqual({ Authorization: 'Bearer secret' });
      expect(options.body).toBeInstanceOf(FormData);
      const request = JSON.parse(options.body.get('data'));
      expect(request).toMatchObject({
        operations: {
          restorations: { upscale: 'smart_enhance', polish: false },
          resizing: { width: '200%', height: '200%', fit: 'bounds' },
        },
        output: { format: 'png' },
      });
      return new Response(
        JSON.stringify({
          data: { output: { tmp_url: 'https://cdn.claid.ai/enhanced.png' } },
        }),
        { status: 200 }
      );
    });
    const adapter = loadDirectAdapters(
      { CLAID_API_KEY: 'secret' },
      fetchImpl
    ).enhanced;
    const result = await adapter({
      inputs: [
        input,
        { ...input, fileName: 'motion.mp4' },
        { ...input, fileName: 'approximate.glb' },
      ],
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://api.claid.ai/v1/image/edit/upload'
    );
    expect(result).toEqual({
      status: 'complete',
      assets: [
        {
          fileName: 'enhanced-mock.png',
          url: 'https://cdn.claid.ai/enhanced.png',
        },
      ],
    });
  });
});
