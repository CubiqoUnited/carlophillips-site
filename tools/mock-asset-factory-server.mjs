#!/usr/bin/env node

import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

import {
  createDrop,
  listJobs,
  runAllConfiguredAdapters,
  runConfiguredAdapters,
} from './mock-asset-factory.mjs';
import { loadAssetFactoryEnvironment } from './mock-asset-factory-env.mjs';

const DEFAULT_ROOT = resolve('mock-asset-factory-data');
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4177;
const MAX_REQUEST_BYTES = 40 * 1024 * 1024;
const INPUT_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function json(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(`${JSON.stringify(value)}\n`);
}

async function readJson(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > MAX_REQUEST_BYTES) throw new Error('Upload exceeds 40 MB.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function safeInputName(value) {
  const name = basename(value).replace(/[^a-zA-Z0-9._-]/g, '-');
  const extension = name.slice(name.lastIndexOf('.')).toLowerCase();
  if (!name || !INPUT_EXTENSIONS.has(extension)) {
    throw new Error('Mocks must be PNG, JPG, JPEG, or WebP images.');
  }
  return name;
}

function jobDirectory(root, jobId) {
  if (!/^[a-z0-9-]+$/.test(jobId)) throw new Error('Invalid job ID.');
  return join(resolve(root), 'jobs', jobId);
}

function configuredStages(environment = process.env) {
  const gatewayStages = [
    ['merch', environment.MOCK_ASSET_FACTORY_MERCH_URL],
    ['on-model', environment.MOCK_ASSET_FACTORY_ON_MODEL_URL],
    ['3d', environment.MOCK_ASSET_FACTORY_3D_URL],
    ['motion', environment.MOCK_ASSET_FACTORY_MOTION_URL],
    ['enhanced', environment.MOCK_ASSET_FACTORY_ENHANCER_URL],
  ].filter(([, endpoint]) => Boolean(endpoint));
  const directStages = [
    ['merch', environment.FASHN_API_KEY],
    ['on-model', environment.FASHN_API_KEY],
    ['3d', environment.TRIPO_API_KEY || environment.MESHY_API_KEY],
    ['motion', environment.RUNWAYML_API_SECRET],
    ['enhanced', environment.CLAID_API_KEY],
  ].filter(([, key]) => Boolean(key));
  return [...new Map([...gatewayStages, ...directStages]).keys()];
}

function adapterHealth(environment = process.env) {
  const configured = configuredStages(environment);
  const all = ['merch', 'on-model', '3d', 'motion', 'enhanced'];
  return {
    configuredStages: configured,
    missingStages: all.filter((stage) => !configured.includes(stage)),
    ready: configured.length === all.length,
  };
}

async function acceptDrop(root, body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const files = Array.isArray(body.files) ? body.files : [];
  if (!title) throw new Error('Give this drop a name.');
  if (files.length < 1 || files.length > 2) {
    throw new Error('Drop one or two product mock images.');
  }
  const uploadDirectory = join(resolve(root), 'uploads');
  await mkdir(uploadDirectory, { recursive: true });
  const inputPaths = [];
  for (const [index, file] of files.entries()) {
    const name = safeInputName(file.name || `mock-${index + 1}.png`);
    if (typeof file.contentBase64 !== 'string') {
      throw new Error(`Missing file data for ${name}.`);
    }
    const bytes = Buffer.from(file.contentBase64, 'base64');
    if (bytes.byteLength === 0 || bytes.byteLength > 20 * 1024 * 1024) {
      throw new Error(`${name} must be between 1 byte and 20 MB.`);
    }
    const path = join(uploadDirectory, `${Date.now()}-${index + 1}-${name}`);
    await writeFile(path, bytes);
    inputPaths.push(path);
  }
  const job = await createDrop({ root, title, inputPaths });
  const automated = await runConfiguredAdapters({
    jobDirectory: job.jobDirectory,
  });
  return automated.manifest;
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mock Asset Factory</title>
  <style>
    :root { color-scheme: dark; --ink:#f7f3eb; --muted:#a9a49d; --line:#343330; --panel:#171716; --accent:#ff6b4a; --green:#75d896; --blue:#72b5ff; --radius:22px; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; background:#0d0d0c; color:var(--ink); font:15px/1.45 Inter, ui-sans-serif, system-ui, sans-serif; }
    button,input { font:inherit; }
    .shell { width:min(1180px, calc(100% - 32px)); margin:0 auto; padding:42px 0 70px; }
    header { display:flex; justify-content:space-between; gap:28px; align-items:flex-end; margin-bottom:28px; }
    .eyebrow { color:var(--accent); font-size:12px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; }
    h1 { margin:8px 0 8px; font-size:clamp(34px,6vw,72px); line-height:.94; letter-spacing:-.055em; font-weight:650; }
    header p { margin:0; color:var(--muted); max-width:650px; }
    .system { border:1px solid var(--line); border-radius:999px; padding:9px 13px; color:var(--green); max-width:100%; overflow-wrap:anywhere; }
    .grid { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr); gap:18px; }
    .panel { background:var(--panel); border:1px solid var(--line); border-radius:var(--radius); padding:22px; box-shadow:0 20px 70px rgba(0,0,0,.28); }
    .panel h2 { margin:0 0 6px; font-size:20px; }
    .panel-intro { color:var(--muted); margin:0 0 18px; }
    label { display:block; font-size:12px; color:var(--muted); margin-bottom:7px; text-transform:uppercase; letter-spacing:.12em; }
    input[type=text] { width:100%; border:1px solid #44423f; color:var(--ink); background:#10100f; border-radius:13px; padding:13px 14px; outline:none; }
    input[type=text]:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(114,181,255,.13); }
    .dropzone { margin-top:16px; border:1.5px dashed #55514b; border-radius:18px; min-height:250px; padding:22px; display:grid; place-items:center; text-align:center; cursor:pointer; transition:.2s ease; }
    .dropzone.drag, .dropzone:focus-within { border-color:var(--accent); background:rgba(255,107,74,.06); }
    .dropzone strong { display:block; font-size:21px; margin-bottom:5px; }
    .dropzone span { color:var(--muted); }
    #file-input { position:absolute; width:1px; height:1px; opacity:0; }
    .previews { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; width:100%; margin-top:16px; }
    .preview { position:relative; aspect-ratio:4/3; overflow:hidden; border-radius:12px; background:#0c0c0b; border:1px solid var(--line); }
    .preview img { width:100%; height:100%; object-fit:contain; }
    .actions { display:flex; gap:10px; align-items:center; margin-top:16px; }
    .primary { border:0; border-radius:999px; padding:13px 19px; background:var(--ink); color:#111; font-weight:800; cursor:pointer; }
    .primary:disabled { opacity:.4; cursor:not-allowed; }
    #message { color:var(--muted); font-size:13px; }
    .steps { display:grid; gap:9px; margin-top:18px; }
    .step { display:grid; grid-template-columns:30px 1fr auto; gap:10px; align-items:center; border-top:1px solid var(--line); padding-top:11px; }
    .step:first-child { border-top:0; padding-top:0; }
    .number { width:28px; height:28px; display:grid; place-items:center; border-radius:9px; background:#262522; color:var(--muted); font-weight:800; }
    .step b { display:block; }
    .step small { color:var(--muted); }
    .badge { color:var(--blue); font-size:12px; }
    .jobs { margin-top:18px; }
    .jobs-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    .jobs-head h2 { margin:0; }
    .job-list { display:grid; gap:10px; }
    .job { display:grid; grid-template-columns:1fr auto; gap:10px; border:1px solid var(--line); border-radius:16px; padding:15px; background:#121211; }
    .job h3 { margin:0 0 3px; font-size:15px; }
    .job p { margin:0; color:var(--muted); font-size:12px; }
    .state { align-self:start; border-radius:999px; padding:6px 9px; background:#232320; color:var(--green); font-size:11px; text-transform:uppercase; letter-spacing:.07em; }
    .empty { color:var(--muted); padding:18px 0; }
    @media (max-width:800px) { header { align-items:flex-start; flex-direction:column; } .grid { grid-template-columns:1fr; } .system { order:-1; } }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div><div class="eyebrow">Independent rich-media automation</div><h1>Drop a mock.<br />Collect the assets.</h1><p>One or two product references become tracked merch, on-model, 3D, motion and enhanced-media jobs. The system stops with a truth-labelled review package.</p></div>
      <div class="system" id="system-status">Checking adapters…</div>
    </header>
    <section class="grid">
      <form class="panel" id="drop-form">
        <h2>New asset job</h2><p class="panel-intro">No Shopify, POD product or publishing action.</p>
        <label for="title">Drop name</label><input id="title" name="title" type="text" placeholder="Black heavyweight hoodie" required />
        <label class="dropzone" id="dropzone" for="file-input" tabindex="0">
          <input id="file-input" type="file" accept="image/png,image/jpeg,image/webp" multiple />
          <div id="drop-copy"><strong>Drop 1–2 mock images</strong><span>PNG, JPG or WebP · up to 20 MB each</span></div>
          <div class="previews" id="previews"></div>
        </label>
        <div class="actions"><button class="primary" id="submit" type="submit">Start automation</button><span id="message">Waiting for a mock.</span></div>
      </form>
      <aside class="panel">
        <h2>What runs</h2><p class="panel-intro">Each output is recorded with its source and truth label.</p>
        <div class="steps">
          <div class="step"><span class="number">1</span><div><b>Merch pack</b><small>FASHN Edit → front, back, side, detail candidates</small></div><span class="badge">IMAGE</span></div>
          <div class="step"><span class="number">2</span><div><b>On-model pack</b><small>FASHN Product to Model → four fit candidates</small></div><span class="badge">IMAGE</span></div>
          <div class="step"><span class="number">3</span><div><b>Approximate 3D</b><small>Tripo → truth-labelled textured GLB candidate</small></div><span class="badge">3D</span></div>
          <div class="step"><span class="number">4</span><div><b>Motion</b><small>Runway → walk and product showcase clips</small></div><span class="badge">VIDEO</span></div>
          <div class="step"><span class="number">5</span><div><b>Enhance + package</b><small>Claid 2× image enhance → manifest and review folder</small></div><span class="badge">READY</span></div>
        </div>
      </aside>
    </section>
    <section class="jobs"><div class="jobs-head"><h2>Recent jobs</h2><span id="job-count"></span></div><div class="job-list" id="job-list"><div class="empty">No drops yet.</div></div></section>
  </main>
  <script>
    const fileInput=document.querySelector('#file-input'); const dropzone=document.querySelector('#dropzone'); const previews=document.querySelector('#previews'); const message=document.querySelector('#message'); const submit=document.querySelector('#submit'); let files=[];
    const stateLabel=(value)=>value.replaceAll('_',' ');
    function setFiles(next){ files=[...next].slice(0,2); previews.innerHTML=''; document.querySelector('#drop-copy').hidden=files.length>0; for(const file of files){const frame=document.createElement('div');frame.className='preview';const image=document.createElement('img');image.alt=file.name;image.src=URL.createObjectURL(file);frame.append(image);previews.append(frame);} message.textContent=files.length?files.length+' mock'+(files.length>1?'s':'')+' ready.':'Waiting for a mock.'; }
    fileInput.addEventListener('change',()=>setFiles(fileInput.files)); dropzone.addEventListener('dragover',(event)=>{event.preventDefault();dropzone.classList.add('drag')}); dropzone.addEventListener('dragleave',()=>dropzone.classList.remove('drag')); dropzone.addEventListener('drop',(event)=>{event.preventDefault();dropzone.classList.remove('drag');setFiles(event.dataTransfer.files)});
    const encode=(file)=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,contentBase64:String(reader.result).split(',')[1]});reader.onerror=reject;reader.readAsDataURL(file)});
    async function loadJobs(){const [health,jobs]=await Promise.all([fetch('/api/health').then(r=>r.json()),fetch('/api/jobs').then(r=>r.json())]);const system=document.querySelector('#system-status');system.textContent=health.ready?'All adapters connected':health.configuredStages.length+'/5 connected · missing '+health.missingStages.join(', ');system.title=health.ready?'Ready to generate all five stages':'Add missing credentials to .env.mock-assets.local';document.querySelector('#job-count').textContent=jobs.length+' total';const list=document.querySelector('#job-list');list.innerHTML=jobs.length?'':'<div class="empty">No drops yet.</div>';for(const job of jobs){const item=document.createElement('article');item.className='job';const detail=document.createElement('div');const heading=document.createElement('h3');heading.textContent=job.title;const meta=document.createElement('p');meta.textContent=job.readyAssets.length+' assets · '+job.readyStageIds.length+'/5 stages';detail.append(heading,meta);const state=document.createElement('span');state.className='state';state.textContent=stateLabel(job.state);item.append(detail,state);list.append(item)}}
    document.querySelector('#drop-form').addEventListener('submit',async(event)=>{event.preventDefault();if(files.length<1){message.textContent='Drop at least one mock first.';return}submit.disabled=true;message.textContent='Creating the asset job…';try{const payload={title:document.querySelector('#title').value,files:await Promise.all(files.map(encode))};const response=await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const body=await response.json();if(!response.ok)throw new Error(body.error);message.textContent='Job created: '+stateLabel(body.state);setFiles([]);document.querySelector('#title').value='';await loadJobs()}catch(error){message.textContent=error.message}finally{submit.disabled=false}}); loadJobs(); setInterval(loadJobs,4000);
  </script>
</body>
</html>`;

export function createAssetFactoryServer({ root = DEFAULT_ROOT } = {}) {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(
        request.url,
        `http://${request.headers.host || 'localhost'}`
      );
      if (request.method === 'GET' && url.pathname === '/') {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(PAGE);
        return;
      }
      if (request.method === 'GET' && url.pathname === '/api/health') {
        json(response, 200, {
          status: 'ok',
          ...adapterHealth(),
          independent: true,
        });
        return;
      }
      if (request.method === 'GET' && url.pathname === '/api/jobs') {
        json(response, 200, await listJobs(root));
        return;
      }
      if (request.method === 'POST' && url.pathname === '/api/jobs') {
        json(response, 201, await acceptDrop(root, await readJson(request)));
        return;
      }
      const runMatch = url.pathname.match(/^\/api\/jobs\/([a-z0-9-]+)\/run$/);
      if (request.method === 'POST' && runMatch) {
        const result = await runConfiguredAdapters({
          jobDirectory: jobDirectory(root, runMatch[1]),
        });
        json(response, 200, result.manifest);
        return;
      }
      json(response, 404, { error: 'Not found.' });
    } catch (error) {
      json(response, 400, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
  return server;
}

export async function startAssetFactoryServer({
  root = DEFAULT_ROOT,
  host = DEFAULT_HOST,
  port = DEFAULT_PORT,
  automationIntervalMs = 4000,
} = {}) {
  const server = createAssetFactoryServer({ root });
  await new Promise((resolveStart, rejectStart) => {
    server.once('error', rejectStart);
    server.listen(port, host, resolveStart);
  });
  const automation =
    automationIntervalMs > 0
      ? setInterval(
          () =>
            runAllConfiguredAdapters({ root }).catch((error) =>
              console.error(error)
            ),
          automationIntervalMs
        )
      : null;
  server.once('close', () => {
    if (automation) clearInterval(automation);
  });
  return server;
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--root') values.root = argv[++index];
    else if (argv[index] === '--host') values.host = argv[++index];
    else if (argv[index] === '--port') values.port = Number(argv[++index]);
    else if (argv[index] === '--env') values.env = argv[++index];
    else if (argv[index] === '--no-env') values.noEnv = true;
    else if (argv[index] === '--no-automation') values.automationIntervalMs = 0;
  }
  return values;
}

if (
  resolve(process.argv[1] || '') === resolve(new URL(import.meta.url).pathname)
) {
  const options = parseArgs(process.argv.slice(2));
  const environment = options.noEnv
    ? { loaded: false, path: 'disabled by --no-env' }
    : loadAssetFactoryEnvironment(options.env);
  startAssetFactoryServer(options)
    .then(() => {
      process.stdout.write(
        `Mock Asset Factory: http://${options.host || DEFAULT_HOST}:${options.port || DEFAULT_PORT}\nProvider environment: ${environment.loaded ? `loaded ${environment.path}` : `not found (${environment.path})`}\n`
      );
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
