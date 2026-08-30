const RUNWAY_VERSION = '2024-11-06';

const RUNWAY_WALK_PROMPT =
  'Locked-off camera. The male fashion model begins poised and confident, then takes exactly two slow measured heel-to-toe steps directly toward camera with restrained natural opposite arm swing. He stops, settles his weight, opens his shoulders, makes a planted 30-degree quarter turn to his left, and holds a confident three-quarter pose with alert eyes, relaxed jaw, and a subtle closed-mouth smile. The heavyweight black hoodie responds with realistic delayed folds at elbows and hem, then settles cleanly to reveal its silhouette. Preserve the same person, face, proportions, hood, drawstrings, kangaroo pocket, cuffs, hem, small CP chest embroidery, trousers, shoes, concrete architecture, lighting, floor space, and portrait framing. Continuous silent luxury fashion film. Camera and background remain completely fixed; no added people, crop, scene change, garment alteration, logo mutation, foot sliding, or sleepy expression.';

const PRODUCT_SHOWCASE_PROMPT =
  'Locked-off camera. The male model holds the three-quarter pose and performs a restrained luxury garment study: a small confident shoulder roll and posture lift, his free hand relaxes naturally beside him while the pocketed hand remains composed, then he turns his torso 12 degrees and settles to present the hoodie side silhouette. Alert eyes, relaxed jaw, subtle closed-mouth confidence, and natural warmth in the cheeks. Heavyweight black fabric responds with minimal believable folds and settles cleanly. Preserve the same person, face, small CP chest embroidery, hood, drawstrings, kangaroo pocket, seams, cuffs, hem, trousers, concrete set, lighting, and portrait framing. Continuous silent editorial motion. Camera and background remain fixed; no walking, crop, scene change, hand crossing the logo, added objects, garment reshaping, or logo mutation.';

function extensionMime(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function dataUri(input) {
  return `data:${extensionMime(input.fileName)};base64,${input.contentBase64}`;
}

function isEnhanceableImage(input) {
  return /\.(?:jpe?g|png|webp)$/i.test(input.fileName);
}

async function checkedJson(response, label) {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `${label} failed with HTTP ${response.status}: ${detail.slice(0, 300)}`
    );
  }
  return response.json();
}

function fashnAdapter(apiKey, fetchImpl) {
  return async ({ externalJob, inputs }) => {
    const headers = { Authorization: `Bearer ${apiKey}` };
    if (!externalJob) {
      const result = await checkedJson(
        await fetchImpl('https://api.fashn.ai/v1/run', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model_name: 'product-to-model',
            inputs: {
              product_image: dataUri(inputs[0]),
              prompt:
                'Luxury concrete studio, full-body fashion catalogue view, product clearly visible, fixed neutral lighting.',
              num_images: 4,
              generation_mode: 'quality',
              resolution: '2k',
              output_format: 'png',
            },
          }),
        }),
        'FASHN dispatch'
      );
      return {
        status: 'accepted',
        jobId: result.id,
        providerState: { predictionId: result.id },
      };
    }
    const predictionId =
      externalJob.providerState?.predictionId || externalJob.jobId;
    const result = await checkedJson(
      await fetchImpl(
        `https://api.fashn.ai/v1/status/${encodeURIComponent(predictionId)}`,
        {
          headers,
        }
      ),
      'FASHN poll'
    );
    if (['starting', 'in_queue', 'processing'].includes(result.status)) {
      return {
        status: 'processing',
        jobId: predictionId,
        providerState: { predictionId },
      };
    }
    if (result.status === 'failed') {
      return {
        status: 'failed',
        error: result.error?.message || 'FASHN generation failed.',
      };
    }
    return {
      status: 'complete',
      assets: result.output.map((url, index) => ({
        fileName: `on-model-${String(index + 1).padStart(2, '0')}.png`,
        url,
      })),
    };
  };
}

const MERCH_VIEW_PROMPTS = Object.freeze([
  {
    id: 'front',
    prompt:
      'Create a clean isolated front catalogue view of this exact product on a neutral background. Preserve colour, proportions, construction, artwork and logo placement. No person.',
  },
  {
    id: 'back',
    prompt:
      'Create a clean isolated back catalogue candidate of this product on a neutral background. Preserve the known colour, construction and proportions; do not invent branding. No person.',
  },
  {
    id: 'side',
    prompt:
      'Create a clean isolated side-profile catalogue candidate of this product on a neutral background. Preserve material weight, silhouette and construction. No person.',
  },
  {
    id: 'detail',
    prompt:
      'Create a close catalogue detail candidate showing the existing fabric, seams and visible logo or artwork. Preserve the supplied design; do not invent text, branding or construction.',
  },
]);

function fashnMerchAdapter(apiKey, fetchImpl) {
  const headers = { Authorization: `Bearer ${apiKey}` };
  return async ({ externalJob, inputs }) => {
    if (!externalJob) {
      const source = dataUri(inputs[0]);
      const tasks = await Promise.all(
        MERCH_VIEW_PROMPTS.map(async ({ id, prompt }) =>
          checkedJson(
            await fetchImpl('https://api.fashn.ai/v1/run', {
              method: 'POST',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model_name: 'edit',
                inputs: {
                  image: source,
                  prompt,
                  generation_mode: 'quality',
                  resolution: '2k',
                  output_format: 'png',
                },
              }),
            }),
            `FASHN merch ${id} dispatch`
          )
        )
      );
      const taskIds = tasks.map((task) => task.id);
      return {
        status: 'accepted',
        jobId: taskIds.join(','),
        providerState: { taskIds },
      };
    }
    const taskIds =
      externalJob.providerState?.taskIds || externalJob.jobId.split(',');
    const results = await Promise.all(
      taskIds.map(async (taskId) =>
        checkedJson(
          await fetchImpl(
            `https://api.fashn.ai/v1/status/${encodeURIComponent(taskId)}`,
            { headers }
          ),
          'FASHN merch poll'
        )
      )
    );
    if (
      results.some((result) =>
        ['starting', 'in_queue', 'processing'].includes(result.status)
      )
    ) {
      return {
        status: 'processing',
        jobId: taskIds.join(','),
        providerState: { taskIds },
      };
    }
    const failed = results.find((result) => result.status === 'failed');
    if (failed) {
      return {
        status: 'failed',
        error: failed.error?.message || 'FASHN merchandise edit failed.',
      };
    }
    return {
      status: 'complete',
      assets: results.flatMap((result, resultIndex) =>
        result.output.map((url, outputIndex) => ({
          fileName: `merch-${MERCH_VIEW_PROMPTS[resultIndex].id}-${outputIndex + 1}.png`,
          url,
        }))
      ),
    };
  };
}

function meshyAdapter(apiKey, fetchImpl) {
  return async ({ externalJob, inputs }) => {
    const headers = { Authorization: `Bearer ${apiKey}` };
    if (!externalJob) {
      const result = await checkedJson(
        await fetchImpl('https://api.meshy.ai/openapi/v1/image-to-3d', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: dataUri(inputs[0]),
            ai_model: 'latest',
            model_type: 'standard',
            enable_pbr: true,
            should_texture: true,
            should_remesh: true,
            target_formats: ['glb'],
          }),
        }),
        'Meshy dispatch'
      );
      return {
        status: 'accepted',
        jobId: result.result,
        providerState: { taskId: result.result },
      };
    }
    const taskId = externalJob.providerState?.taskId || externalJob.jobId;
    const result = await checkedJson(
      await fetchImpl(
        `https://api.meshy.ai/openapi/v1/image-to-3d/${encodeURIComponent(taskId)}`,
        { headers }
      ),
      'Meshy poll'
    );
    if (['PENDING', 'IN_PROGRESS'].includes(result.status)) {
      return { status: 'processing', jobId: taskId, providerState: { taskId } };
    }
    if (result.status !== 'SUCCEEDED') {
      return {
        status: 'failed',
        error:
          result.task_error?.message || `Meshy task ended as ${result.status}.`,
      };
    }
    return {
      status: 'complete',
      assets: [
        { fileName: 'approximate-product.glb', url: result.model_urls.glb },
        ...(result.thumbnail_url
          ? [
              {
                fileName: 'approximate-product-preview.png',
                url: result.thumbnail_url,
              },
            ]
          : []),
      ],
    };
  };
}

function tripoFileFormat(fileName) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!match) return 'png';
  return match[1] === 'jpeg' ? 'jpg' : match[1];
}

function tripoData(result, label) {
  if (result.code !== 0 || !result.data) {
    throw new Error(
      `${label} failed: ${result.message || `Tripo code ${result.code}`}`
    );
  }
  return result.data;
}

function tripoAdapter(apiKey, fetchImpl) {
  const baseUrl = 'https://openapi.tripo3d.ai/v3';
  const headers = { Authorization: `Bearer ${apiKey}` };
  return async ({ externalJob, inputs }) => {
    if (!externalJob) {
      const input = inputs[0];
      const presignResult = await checkedJson(
        await fetchImpl(`${baseUrl}/files/presign`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ format: tripoFileFormat(input.fileName) }),
        }),
        'Tripo presign'
      );
      const presign = tripoData(presignResult, 'Tripo presign');
      const uploadUrl = new URL(presign.presigned_url);
      if (uploadUrl.protocol !== 'https:') {
        throw new Error('Tripo returned a non-HTTPS upload URL.');
      }
      const uploadResponse = await fetchImpl(uploadUrl.href, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: Buffer.from(input.contentBase64, 'base64'),
      });
      if (!uploadResponse.ok) {
        throw new Error(`Tripo upload failed with HTTP ${uploadResponse.status}.`);
      }
      const taskResult = await checkedJson(
        await fetchImpl(`${baseUrl}/generation/image-to-model`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: presign.file_token,
            model: 'v3.1-20260211',
            texture: true,
            pbr: true,
            texture_quality: 'standard',
            enable_image_autofix: true,
            orientation: 'align_image',
          }),
        }),
        'Tripo image-to-model dispatch'
      );
      const task = tripoData(taskResult, 'Tripo image-to-model dispatch');
      return {
        status: 'accepted',
        jobId: task.task_id,
        providerState: { taskId: task.task_id },
      };
    }
    const taskId = externalJob.providerState?.taskId || externalJob.jobId;
    const taskResult = await checkedJson(
      await fetchImpl(`${baseUrl}/tasks/${encodeURIComponent(taskId)}`, {
        headers,
      }),
      'Tripo poll'
    );
    const task = tripoData(taskResult, 'Tripo poll');
    if (['queued', 'running'].includes(task.status)) {
      return { status: 'processing', jobId: taskId, providerState: { taskId } };
    }
    if (task.status !== 'success') {
      return {
        status: 'failed',
        error:
          task.error_message || `Tripo task ended as ${task.status || 'unknown'}.`,
      };
    }
    if (!task.output?.model_url) {
      return { status: 'failed', error: 'Tripo returned no GLB model URL.' };
    }
    return {
      status: 'complete',
      assets: [
        { fileName: 'approximate-product.glb', url: task.output.model_url },
        ...(task.output.rendered_image_url
          ? [
              {
                fileName: 'approximate-product-preview.png',
                url: task.output.rendered_image_url,
              },
            ]
          : []),
      ],
    };
  };
}

async function runwayTask(fetchImpl, apiKey, body) {
  return checkedJson(
    await fetchImpl('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': RUNWAY_VERSION,
      },
      body: JSON.stringify(body),
    }),
    'Runway dispatch'
  );
}

function runwayAdapter(apiKey, fetchImpl) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'X-Runway-Version': RUNWAY_VERSION,
  };
  return async ({ externalJob, inputs }) => {
    if (!externalJob) {
      const promptImage = dataUri(inputs[0]);
      const [walk, showcase] = await Promise.all([
        runwayTask(fetchImpl, apiKey, {
          model: 'gen4.5',
          promptImage,
          promptText: RUNWAY_WALK_PROMPT,
          ratio: '768:1280',
          duration: 10,
        }),
        runwayTask(fetchImpl, apiKey, {
          model: 'gen4.5',
          promptImage,
          promptText: PRODUCT_SHOWCASE_PROMPT,
          ratio: '768:1280',
          duration: 5,
        }),
      ]);
      return {
        status: 'accepted',
        jobId: `${walk.id},${showcase.id}`,
        providerState: { taskIds: [walk.id, showcase.id] },
      };
    }
    const taskIds =
      externalJob.providerState?.taskIds || externalJob.jobId.split(',');
    const tasks = await Promise.all(
      taskIds.map(async (taskId) =>
        checkedJson(
          await fetchImpl(
            `https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(taskId)}`,
            { headers }
          ),
          'Runway poll'
        )
      )
    );
    if (
      tasks.some((task) =>
        ['PENDING', 'RUNNING', 'THROTTLED'].includes(task.status)
      )
    ) {
      return {
        status: 'processing',
        jobId: taskIds.join(','),
        providerState: { taskIds },
      };
    }
    const failed = tasks.find((task) => task.status !== 'SUCCEEDED');
    if (failed)
      return {
        status: 'failed',
        error: failed.failure || `Runway task ended as ${failed.status}.`,
      };
    return {
      status: 'complete',
      assets: tasks.flatMap((task, taskIndex) =>
        task.output.map((url, outputIndex) => ({
          fileName: `${taskIndex === 0 ? 'runway-walk' : 'product-showcase'}-${outputIndex + 1}.mp4`,
          url,
        }))
      ),
    };
  };
}

function claidOutputUrl(result) {
  return (
    result?.data?.output?.tmp_url ||
    result?.data?.tmp_url ||
    result?.output?.tmp_url ||
    result?.tmp_url ||
    null
  );
}

function claidEnhancerAdapter(apiKey, fetchImpl) {
  return async ({ inputs }) => {
    const images = inputs.filter(isEnhanceableImage);
    if (images.length === 0) {
      return {
        status: 'failed',
        error: 'Claid enhancement received no PNG, JPEG, or WebP images.',
      };
    }
    const assets = await Promise.all(
      images.map(async (input) => {
        const form = new FormData();
        form.append(
          'file',
          new Blob([Buffer.from(input.contentBase64, 'base64')], {
            type: extensionMime(input.fileName),
          }),
          input.fileName
        );
        form.append(
          'data',
          JSON.stringify({
            operations: {
              restorations: {
                decompress: 'auto',
                upscale: 'smart_enhance',
                polish: false,
              },
              resizing: {
                width: '200%',
                height: '200%',
                fit: 'bounds',
              },
            },
            output: { format: 'png' },
          })
        );
        const result = await checkedJson(
          await fetchImpl('https://api.claid.ai/v1/image/edit/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}` },
            body: form,
          }),
          `Claid enhancement ${input.fileName}`
        );
        const url = claidOutputUrl(result);
        if (!url) {
          throw new Error(
            `Claid enhancement ${input.fileName} returned no temporary output URL.`
          );
        }
        return {
          fileName: `enhanced-${input.fileName.replace(/\.[^.]+$/, '')}.png`,
          url,
        };
      })
    );
    return { status: 'complete', assets };
  };
}

export function loadDirectAdapters(
  environment = process.env,
  fetchImpl = fetch
) {
  return {
    ...(environment.FASHN_API_KEY
      ? {
          merch: fashnMerchAdapter(environment.FASHN_API_KEY, fetchImpl),
          'on-model': fashnAdapter(environment.FASHN_API_KEY, fetchImpl),
        }
      : {}),
    ...(environment.TRIPO_API_KEY
      ? { '3d': tripoAdapter(environment.TRIPO_API_KEY, fetchImpl) }
      : environment.MESHY_API_KEY
        ? { '3d': meshyAdapter(environment.MESHY_API_KEY, fetchImpl) }
      : {}),
    ...(environment.RUNWAYML_API_SECRET
      ? { motion: runwayAdapter(environment.RUNWAYML_API_SECRET, fetchImpl) }
      : {}),
    ...(environment.CLAID_API_KEY
      ? {
          enhanced: claidEnhancerAdapter(
            environment.CLAID_API_KEY,
            fetchImpl
          ),
        }
      : {}),
  };
}

export const DIRECT_ADAPTER_PROMPTS = Object.freeze({
  merchViews: MERCH_VIEW_PROMPTS,
  runwayWalk: RUNWAY_WALK_PROMPT,
  productShowcase: PRODUCT_SHOWCASE_PROMPT,
});
